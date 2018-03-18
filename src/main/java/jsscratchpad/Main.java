package jsscratchpad;
import static spark.Spark.get;
import static spark.Spark.port;
import static spark.Spark.post;
import static spark.Spark.staticFileLocation;
import static spark.Spark.stop;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import javax.sql.DataSource;

import com.google.gson.Gson;

import freemarker.template.Configuration;
import freemarker.template.TemplateExceptionHandler;
import spark.ModelAndView;
import spark.Spark;
import spark.template.freemarker.FreeMarkerEngine;

public class Main {

	public static void main(String[] args) {
		try {
	        Configuration cfg = new Configuration(Configuration.VERSION_2_3_23);
	        cfg.setClassForTemplateLoading(Main.class, "/public");
	        cfg.setDefaultEncoding("UTF-8");
	        cfg.setTemplateExceptionHandler(TemplateExceptionHandler.RETHROW_HANDLER);
	        cfg.setLogTemplateExceptions(false);
	        final FreeMarkerEngine dbEngine = new FreeMarkerEngine(cfg);
	        final Gson gson = new Gson();
			final DataSource dataSource = DatabaseUtil.getDatasource();
//			SnippetsUtil.createTable();
	        
			port(Integer.valueOf(System.getenv("PORT")));
			staticFileLocation("/public");
			
			final CanvasViewer viewer = new CanvasViewer();
			Spark.webSocket("/sketch/connect", viewer);
			

			try (Connection connection = dataSource.getConnection()) {

				Statement stmt = connection.createStatement();

				stmt.execute("DROP TABLE IF EXISTS users;");
				stmt.execute("CREATE TABLE users("
						+ "id serial primary key, "
						+ "username VARCHAR(100) NOT NULL, "
						+ "password VARCHAR(5000) NOT NULL,"
						+ "creationdate TIMESTAMP NOT NULL,"
						+ "lastlogin TIMESTAMP);");
				

				PreparedStatement ps = connection
						.prepareStatement("INSERT INTO users (username, password, creationdate) VALUES (?,?,now());");
				
				ps.setString(1, "Yousif");
				ps.setString(2, PasswordUtil.hashPassword("pass"));
				ps.executeUpdate();
			
			} catch (Exception e) {
				e.printStackTrace();
			}

			get("/users", (request, response) -> {
				try (Connection connection = dataSource.getConnection()) {
					Statement stmt = connection.createStatement();
					ResultSet rs = stmt.executeQuery("SELECT * FROM users;");
					
					ArrayList<User> output = new ArrayList<User>();
					while (rs.next()) {
						User l = new User();
						l.setId(Integer.parseInt(rs.getString("id")));
						l.setUsername(rs.getString("username"));
						l.setPassword(rs.getString("password"));
						l.setCreationdate(rs.getTimestamp("creationdate"));
						output.add(l);
					}
					return output;
					
				} catch (Exception e) {
					e.printStackTrace();
				}
				return null;
			}, gson::toJson);
			get("/adduser", (request, response) -> {
				try (Connection connection = dataSource.getConnection()) {
					
					User u = new User();
					u.setUsername(UUID.randomUUID().toString().substring(0, 8));
					u.setPassword(PasswordUtil.hashPassword("pass"));
					Timestamp ts = Timestamp.valueOf(LocalDateTime.now());
					u.setCreationdate(ts);
					
					PreparedStatement ps = connection
							.prepareStatement("INSERT INTO users (username, password, creationdate) VALUES (?,?,?);");
					
					ps.setString(1, u.getUsername());
					ps.setString(2, u.getPassword());
					ps.setTimestamp(3, ts);
					ps.executeUpdate();
					
					return u;
				} catch (Exception e) {
					e.printStackTrace();
				}
				return null;
			}, gson::toJson);

			get("/login/:u/:p", (req, res) -> {
				try (Connection connection = dataSource.getConnection()) {

					String username = req.params(":u");//eq.queryParams("username");
					String password = req.params(":p");//eq.queryParams("password");

					PreparedStatement ps = connection
							.prepareStatement("SELECT * FROM users where username = ?");
					ps.setString(1, username);
					ResultSet rs = ps.executeQuery();
					int count = 0;
					boolean valid = false;
					while (rs.next()) {
						valid = PasswordUtil.check(password, rs.getString("password"));
						count++;
						if(count>1) {
							res.status(500);
							return "";
						}
					}
					
					if(!valid) {
						res.status(500);
						return "";
					}

					res.status(200);
					return "";
				} catch (Exception e) {
					e.printStackTrace();
					res.status(500);
					return null;
				}
			});
			
			get("/register/:u/:p", (req, res) -> {
				try (Connection connection = dataSource.getConnection()) {

					String username = req.params(":u");//req.queryParams("username");
					String password = req.params(":p");//req.queryParams("password");

					PreparedStatement ps = connection
							.prepareStatement("SELECT * FROM users where username = ?");
					ps.setString(1, username);
					ResultSet rs = ps.executeQuery();
					if (rs.next()) {
						res.status(500);
						return "";
					}
					
					User u = new User();
					u.setUsername(username);
					u.setPassword(PasswordUtil.hashPassword(password));
					Timestamp ts = Timestamp.valueOf(LocalDateTime.now());
					u.setCreationdate(ts);
					
					ps = connection
							.prepareStatement("INSERT INTO users (username, password, creationdate) VALUES (?,?,?);");
					
					ps.setString(1, u.getUsername());
					ps.setString(2, u.getPassword());
					ps.setTimestamp(3, ts);
					ps.executeUpdate();

					res.status(200);
					return u;
				} catch (Exception e) {
					e.printStackTrace();
					res.status(500);
					return null;
				}
			});

			
			get("/", (request, response) -> {
				response.redirect("editor.html"); 
				return null;
			});

			get("/edit/save", (req, res) -> {
				try (Connection connection = dataSource.getConnection()) {
					PreparedStatement stmt;
					stmt = connection.prepareStatement(renderSQL("/db/postcode.ftl"));
					stmt.setString(1, "Yousif");
					stmt.setString(2, "console.log(\"Example 1\");");
					stmt.setString(3, "Example 1");
					stmt.executeUpdate();
					return "Success " + renderSQL("/db/postcode.ftl");
				} catch (Exception e) {
					return e.getMessage();
				}
			});
			
			get("/edit/load", (req, res) -> {
				try (Connection connection = dataSource.getConnection()) {
					Statement stmt = connection.createStatement();
					ResultSet rs = stmt.executeQuery(renderSQL("/db/getcode.ftl"));
					
					ArrayList<String> output = new ArrayList<String>();
					while (rs.next()) {
						output.add(rs.getString("snippet"));
					}
					
					return output.get(0);
				} catch (Exception e) {
					return e.getMessage();
				}
			});
			
			get("/snippets/get", (req, res) -> {
				res.type("application/json");
				try (Connection connection = dataSource.getConnection()) {
					Statement stmt = connection.createStatement();
					ResultSet rs = stmt.executeQuery("SELECT * FROM snippets;");
					
					ArrayList<Snippet> output = new ArrayList<Snippet>();
					while (rs.next()) {
						Snippet l = new Snippet();
						l.setId(String.format("%03d", Integer.parseInt(rs.getString("id"))));
						l.setTitle(rs.getString("title"));
						l.setSnippet(rs.getString("snippet"));
						output.add(l);
					}
					System.out.println(output.size());
					return output;
				} catch (Exception e) {
					return e.getMessage();
				}
			}, gson::toJson);
			
			get("/snippets/get/:snippetId", (req, res) -> {
				System.out.println(req.params(":snippetId"));
				res.type("application/json");
				try (Connection connection = dataSource.getConnection()) {
					PreparedStatement stmt = connection.prepareStatement("SELECT * FROM snippets WHERE id = ?;");
					stmt.setInt(1, Integer.parseInt(req.params(":snippetId")));
					ResultSet rs = stmt.executeQuery();

					if (rs.next()) {
						Snippet l = new Snippet();
						l.setId(rs.getString("id"));
						l.setTitle(rs.getString("title"));
						l.setSnippet(rs.getString("snippet"));
						return l;
					} else {
						res.status(404);
					}
					return null;
				} catch (Exception e) {
					return e.getMessage();
				}
			}, gson::toJson);
			
			
			post("/sketch/send", (req, res) -> {
				String id = req.queryParams("id");
				String code = req.queryParams("code");
				viewer.putCode(id, code);
				res.status(200);
				return "";
			});

			get("/sketch/get/:id", (req, res) -> {
				String id = req.params(":id");
				Map<String,String> test = new HashMap<String, String>();
				test.put("code",viewer.getCode(id));
				return new FreeMarkerEngine().render(new ModelAndView(test, "/canvasiframe.ftl"));
			});

			get("/sketch/deleteall", (req, res) -> {
				return "Deleted " + viewer.deleteAll();
			});
			

		} catch (Throwable e) {
			e.printStackTrace();
		}
	}

	public static void stopServer() {
		stop();
	}

	public static String renderSQL(Map<String, Object> model, String templatePath) {
		return new FreeMarkerEngine().render(new ModelAndView(model, templatePath));
	}
	
	public static String renderSQL(String templatePath) {
		return new FreeMarkerEngine().render(new ModelAndView(null, templatePath));
	}

	

}
