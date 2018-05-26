var UserActions = function(scratchpad, editor) {
	var that = this;
	var statusMessageTimeoutHandle = null;
	this.currentSnippet = null;

	bindUI();
	checkLoggedIn(function success(username) {
		$.cookie("username", username);
		console.log(`Logged in as ${username}`);
		userMode();
	}, function fail() {
		guestMode();
	});

	function doIfNotLoggedIn(asWellAs) {
		console.log("Not logged in");
		setStatusMessage(`Please re-login.`, "red", 5000);
		guestMode();
		if(asWellAs) {
			console.log(asWellAs);
			asWellAs();
		}
	}

	this.getUserSnippets = function(success, failure) {
		function doIfLoggedIn() {
			$.ajax({
			  method: "GET",
			  url: "/user/snippet/list"
			})
			.done(success)
			.fail(failure);
		}
		checkLoggedIn(doIfLoggedIn, doIfNotLoggedIn);
	};

	this.loadSnippet = function(id) {
		function doIfLoggedIn() {
			$.ajax({
			  method: "GET",
			  url: "/user/snippet/load/"+id
			})
			.done(function(snippet) {
				let editor = scratchpad.getEditor();
				console.log(snippet);
				editor.setValue(snippet.snippet);
				editor.gotoLine(editor.session.getLength() + 1);
				$('#loadModal').modal('hide');
				setStatusMessage(`Loaded ${snippet.title.substr(0,30)}`, "lightgreen", 2000);
				that.currentSnippet = snippet;
			})
			.fail(function( msg ) {
				console.error("Failed to load user snippet.");
				console.error( msg );
			});
		}
		function ifNotLoggedIn() {
			$('#loadModal').modal('hide');
		}

		var confirmed = confirm("Are you sure you want to load this snippet?");
		if(confirmed) {
			checkLoggedIn(doIfLoggedIn, function(){doIfNotLoggedIn(ifNotLoggedIn)});
		}
	};

	this.saveSnippetAs = function(title, code) {
		function doIfLoggedIn() {
			$.ajax({
			  method: "POST",
			  url: "/user/snippet/save",
			  data: {
			  	title: title,
				snippet: code
			  }
			}).done(function(snippetId) {
				that.currentSnippet = {id: snippetId, title: title};
				console.log(that.currentSnippet);
				console.log("saved successfully.");
				$('#saveModal').modal("hide");
				setStatusMessage("Saved.", "lightgreen", 2000);
			})
			.fail(function( msg ) {
				console.error("Failed to save snippet...");
				console.error( msg );
			});
		}
		function ifNotLoggedIn() {
			$('#saveModal').modal('hide');
		}
		checkLoggedIn(doIfLoggedIn, function(){doIfNotLoggedIn(ifNotLoggedIn)});
	};

	this.saveAsSnippet = function(id, code) {
		function doIfLoggedIn() {
			$('#saveModal').modal('show');
		}
		checkLoggedIn(doIfLoggedIn, doIfNotLoggedIn);
	};
	this.updateSnippet = function(id, code) {
		function doIfLoggedIn() {
			$.ajax({
			  method: "PUT",
			  url: "/user/snippet/update",
			  data: {
			  	id: id,
				snippet: code
			  }
			}).done(function(snippetId) {
				console.log(that.currentSnippet);
				console.log(`Updated '${snippetId}' successfully.`);
				setStatusMessage("Saved.", "lightgreen", 2000);
			})
			.fail(function( msg ) {
				console.error("Failed to save snippet...");
				console.error( msg );
			});
		}
		checkLoggedIn(doIfLoggedIn, doIfNotLoggedIn);
	};

	this.newSnippet = function() {
		that.currentSnippet = null;
		let editor = scratchpad.getEditor();
		editor.setValue("");
	};

	this.deleteSnippetAndRow = function(id, row) {
		function doIfLoggedIn() {
			$.ajax({
			  method: "DELETE",
			  url: "/user/snippet/delete/"+id,
			  data: {
			  	id: id
			  }
			}).done(function() {
				console.log(`deleted '${id}' successfully.`);
			})
			.fail(function( msg ) {
				console.error("Failed to delete snippet...");
				console.error( msg );
			});
		}
		function ifNotLoggedIn() {
			$('#loadModal').modal('hide');
		}
		var confirmed = confirm("Are you sure you want to delete this snippet?");
		if(confirmed) {
			checkLoggedIn(doIfLoggedIn, function(){doIfNotLoggedIn(ifNotLoggedIn)});
			$(row).remove();
		}
	};

	function bindUI() {

		$('#saveModal').on("shown.bs.modal", function() {
			$("#snippetTitleInput").focus();
			if(that.currentSnippet != null) {
				$("#snippetTitleInput").val(that.currentSnippet.title);
				$("#snippetTitleInput").select();
			}
		}); 

		$('#saveModal .submitModal').click(function() {
			console.log("save as submit");
			let editor = scratchpad.getEditor();
			let code = editor.getValue();
			let title = $("#snippetTitleInput").val();
			that.saveSnippetAs(title, code);
			return false;
		}); 

		$('#saveAsUserSnippets').click(function() {
			that.saveAsSnippet();
		});

		$('#viewUserSnippets').click(function() {
			function success(listOfSnippets) {
				console.log(listOfSnippets);
				let snippets = listOfSnippets;
				let tableBody = $("#loadTableBody");
				tableBody.html("");
				for(let i = 0; i < snippets.length; i++) {
					let row = document.createElement("tr");
					let titleCell = document.createElement("td");
					let lastModifiedCell = document.createElement("td");
					let actionsCell = document.createElement("td");
					let actionHtml = "";
					actionHtml += '<button type="button" class="btn btn-secondary loadUserSnippetButton">Load</button>\n';
					actionHtml += '<button type="button" class="btn btn-secondary deleteUserSnippetButton">Delete</button>';
					$(actionsCell).html(actionHtml);
					let snippetId = snippets[i].id;
					let snippetTitle = snippets[i].title;
					let lastModified = snippets[i].lastModified;
					$(titleCell).text(snippetTitle);
					$(lastModifiedCell).text(lastModified);
					$(row).append(titleCell).append(lastModifiedCell).append(actionsCell);
					$(row).addClass("selectableRow");
					(function(l_id) {
						$(actionsCell).children(".loadUserSnippetButton").click(function() {
							that.loadSnippet(l_id);
						});
					})(snippetId);
					(function(l_id, row) {
						$(actionsCell).children(".deleteUserSnippetButton").click(function() {
							that.deleteSnippetAndRow(l_id, row);
						});
					})(snippetId, row);

					$(tableBody).append(row);
				}
				$("#loadModal").modal("show");
			}
			that.getUserSnippets(success, function( msg ) {
				console.error("Failed to get user snippets...");
				console.error( msg );
			});
		}); 

		$('#saveUserSnippets').click(function() {
			if(that.currentSnippet == null) {
				$("#saveAsUserSnippets").click();
			} else {
				let id = that.currentSnippet.id;
				let editor = scratchpad.getEditor();
				let code = editor.getValue();
				that.updateSnippet(id, code);
			}
		}); 

		$('#newUserSnippet').click(function() {
			that.newSnippet();
		}); 


		$('#registerModal .submitModal').click(function() {
			console.log("register submit");
			let u = $("#usernameRegisterInput").val();
			let p = $("#passwordRegisterInput").val();
			let rp = $("#passwordRetypeRegisterInput").val();
			if(p == rp) {
				$('#registerModal .submitModal').attr("disabled", "disabled");
				register(u, p, 
					function success(msg) {
						showStatus("Success", "GreenYellow");
						$('#registerModal .submitModal').removeAttr("disabled");
						$('#registerModal').modal("hide");
						setStatusMessage("Registered successfully", "lightgreen");
						clearAllUserModalInputs();
					},
					function fail(msg) {
						console.log(msg);
						showStatus("Failed: " + (msg.responseText || "Error"), "Crimson");
						$('#registerModal .submitModal').removeAttr("disabled");
				});
			} else {
				showStatus("Passwords don't match", "Crimson");
			}
			function showStatus(text, color) {showModalStatus("registerModal", text, color);}
			return false;
		}); 

		$('#loginModal .submitModal').click(function() {
			console.log("login submit");
			let u = $("#usernameLoginInput").val();
			let p = $("#passwordLoginInput").val();
			$('#loginModal .submitModal').attr("disabled", "disabled");
			login(u, p, 
				function success(msg) {
					showStatus("Success", "GreenYellow");
					clearAllUserModalInputs();
					$('#loginModal .submitModal').removeAttr("disabled");
					$('#loginModal').modal("hide");
					setStatusMessage("Signed in successfully", "lightgreen");
					userMode();
				},
				function fail(msg) {
					showStatus("Failed: Invalid credentials", "Crimson");
					$('#loginModal .submitModal').removeAttr("disabled");
			});
			function showStatus(text, color) {showModalStatus("loginModal", text, color);}
			return false;
		}); 

		$('#loginModal, #registerModal').on("hidden.bs.modal", function() {
			console.log("clearall");
			clearAllUserModalInputs();
			clearAllUserModalStatuses();
		}); 

		$('#loginModal').on("shown.bs.modal", function() {
			$("#usernameLoginInput").focus();
		}); 

		$('#registerModal').on("shown.bs.modal", function() {
			$("#usernameRegisterInput").focus();
		}); 

		$("#logOut").click(function() {
			logout(
			function success() {
				guestMode();
			}
			, 
			function fail() {console.error("Log out failed")});
		});
		
	}

	function userMode() {
		$(".guestControl").hide();
		$(".userControl").show();
		$("#userLabel").text("Signed in as " + $.cookie("username"));
	}

	function setStatusMessage(msg, color, duration) {
		duration = duration || 5000;
		color = color || "white";
		if(statusMessageTimeoutHandle) {
			clearTimeout(statusMessageTimeoutHandle);
		}
		let el = $("#statusMessageLabel");
		el.html("");
		let textEl = document.createElement("span");
		el.append(textEl);
		$(textEl).text(msg);
		$(textEl).css("color", color);
		statusMessageTimeoutHandle = setTimeout(function() {
			$(textEl).fadeOut(1000);
			statusMessageTimeoutHandle = null;
		}, duration);
	}

	function guestMode() {
		$(".guestControl").show();
		$(".userControl").hide();
		$("#userLabel").text("Signed in as guest.");
	}

	function showModalStatus(modalId, text, color) {
		let el = $("#" + modalId + " .modalStatus");
		el.text(text);
		el.css("color", color);
	}

	function clearAllUserModalInputs() {
		$("#usernameRegisterInput").val("");
		$("#passwordRegisterInput").val("");
		$("#passwordRetypeRegisterInput").val("");
		$("#usernameLoginInput").val("");
		$("#passwordLoginInput").val("");
	}

	function clearAllUserModalStatuses() {
		let el;
		el = $("#registerModal .modalStatus");
		el.text("");
		el = $("#loginModal .modalStatus");
		el.text("");
	}

	function login(username, password, success, fail) {
		$.ajax({
		  method: "POST",
		  url: "/login",
		  data: {
			username: username,
			password: password
		  }
		})
		.done(success)
		.fail(fail);
	}

	function logout(success, fail) {
		$.ajax({
		  method: "POST",
		  url: "/logout"
		})
		.done(success)
		.fail(fail);
	}

	function register(username, password, success, fail) {
		$.ajax({
		  method: "POST",
		  url: "/register",
		  data: {
			username: username,
			password: password
		  }
		})
		.done(success)
		.fail(fail);
	}

	function checkLoggedIn(success, fail) {
		$.ajax({
		  method: "GET",
		  url: "/user/check"
		})
		.done(success)
		.fail(fail);
	}

	window.checkLoggedIn = checkLoggedIn;
}