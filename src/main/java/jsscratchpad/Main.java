package jsscratchpad;
import static spark.Spark.get;
import static spark.Spark.port;
import static spark.Spark.staticFileLocation;
import static spark.Spark.stop;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Map;

import javax.sql.DataSource;

import com.google.gson.Gson;

import freemarker.template.Configuration;
import freemarker.template.TemplateExceptionHandler;
import spark.ModelAndView;
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
	        Gson gson = new Gson();
			LessonsUtil.createTable();
	        
			port(Integer.valueOf(System.getenv("PORT")));
			staticFileLocation("/public");
			
			get("/", (request, response) -> {
				response.redirect("editor.html"); 
				return null;
			});
			
			final DataSource dataSource = DatabaseUtil.getDatasource();

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
			
			get("/lessons/get", (req, res) -> {
				res.type("application/json");
				try (Connection connection = dataSource.getConnection()) {
					Statement stmt = connection.createStatement();
					ResultSet rs = stmt.executeQuery("SELECT * FROM lessons;");
					
					ArrayList<Lesson> output = new ArrayList<Lesson>();
					while (rs.next()) {
						Lesson l = new Lesson();
						l.setId(String.format("%03d", Integer.parseInt(rs.getString("id"))));
						l.setTitle(rs.getString("title"));
						l.setSnippet(rs.getString("snippet"));
						output.add(l);
					}
					return output;
				} catch (Exception e) {
					return e.getMessage();
				}
			}, gson::toJson);
			

			get("/lessons/get/:lessonId", (req, res) -> {
				System.out.println(req.params(":lessonId"));
				res.type("application/json");
				try (Connection connection = dataSource.getConnection()) {
					PreparedStatement stmt = connection.prepareStatement("SELECT * FROM lessons WHERE id = ?;");
					stmt.setInt(1, Integer.parseInt(req.params(":lessonId")));
					ResultSet rs = stmt.executeQuery();

					if (rs.next()) {
						Lesson l = new Lesson();
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
