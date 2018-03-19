package jsscratchpad;
import static spark.Spark.get;
import static spark.Spark.port;
import static spark.Spark.post;
import static spark.Spark.staticFileLocation;
import static spark.Spark.stop;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

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
			SnippetsUtil.createTable();
			UserUtil.createTable();
	        
			port(Integer.valueOf(System.getenv("PORT")));
			staticFileLocation("/public");
			
			final CanvasViewer viewer = new CanvasViewer();
			Spark.webSocket("/sketch/connect", viewer);

			get("/users", (request, response) -> {
				return UserUtil.getAllUsers();
			}, gson::toJson);
			
			get("/login/:u/:p", (req, res) -> {
				if(UserUtil.verify(req.params(":u"), req.params(":p"))) {
					res.status(200);
				} else {
					res.status(403);
				}
				return "";
			});
			
			get("/register/:u/:p", (req, res) -> {
				if(UserUtil.register(req.params(":u"), req.params(":p"))) {
					res.status(200);
				} else {
					res.status(403);
				}
				return "";
			});

			
			get("/", (request, response) -> {
				response.redirect("editor.html"); 
				return null;
			});
			
			get("/snippets/get", (req, res) -> {
				res.type("application/json");
				try (Connection connection = dataSource.getConnection();
					Statement stmt = connection.createStatement();
					ResultSet rs = stmt.executeQuery("SELECT * FROM snippets;");) {
					
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
				try (Connection connection = dataSource.getConnection();
					PreparedStatement stmt = connection.prepareStatement("SELECT * FROM snippets WHERE id = ?;");) {
					
					stmt.setInt(1, Integer.parseInt(req.params(":snippetId")));
					
					try (ResultSet rs = stmt.executeQuery()) {
						if (rs.next()) {
							Snippet l = new Snippet();
							l.setId(rs.getString("id"));
							l.setTitle(rs.getString("title"));
							l.setSnippet(rs.getString("snippet"));
							return l;
						}
					}

					res.status(404);
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
