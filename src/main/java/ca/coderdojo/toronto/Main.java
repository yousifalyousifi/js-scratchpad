package ca.coderdojo.toronto;
import static spark.Spark.get;
import static spark.Spark.port;
import static spark.Spark.staticFileLocation;
import static spark.Spark.stop;

import java.net.URI;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

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
	        
			port(Integer.valueOf(System.getenv("PORT")));
			staticFileLocation("/public");

			get("/hello", (req, res) -> "Hello World");

			get("/", (request, response) -> {
				response.redirect("editor.html"); 
				return null;
			});

			get("/editor", (request, response) -> {
				response.redirect("editor.html"); 
				return null;
			});

			HikariConfig config = new HikariConfig();
			config.setJdbcUrl(System.getenv("JDBC_DATABASE_URL"));
			final HikariDataSource dataSource = (config.getJdbcUrl() != null) ? new HikariDataSource(config)
					: new HikariDataSource();

			get("/db", (req, res) -> {
				Map<String, Object> attributes = new HashMap<>();
				try (Connection connection = dataSource.getConnection()) {
					Statement stmt = connection.createStatement();
					stmt.executeUpdate("CREATE TABLE IF NOT EXISTS ticks (tick timestamp)");
					stmt.executeUpdate("INSERT INTO ticks VALUES (now())");
					ResultSet rs = stmt.executeQuery("SELECT tick FROM ticks");

					ArrayList<String> output = new ArrayList<String>();
					while (rs.next()) {
						output.add("Read from DB: " + rs.getTimestamp("tick"));
					}

					attributes.put("results", output);
					return new ModelAndView(attributes, "db.ftl");
				} catch (Exception e) {
					attributes.put("message", "There was an error: " + e);
					return new ModelAndView(attributes, "error.ftl");
				}
			} , new FreeMarkerEngine());

			get("/edit/save", (req, res) -> {
				System.out.println("kk");
				try (Connection connection = dataSource.getConnection()) {
					PreparedStatement stmt;
					System.out.println("kdd");
					stmt = connection.prepareStatement(renderSQL("/db/postcode.ftl"));
					System.out.println("kkwda");
					stmt.setString(1, "Yousif");
					stmt.setString(2, "console.log(\"Example 1\");");
					stmt.setString(3, "Example 1");
					//stmt.executeUpdate();
					return "KK";//renderSQL("/db/postcode.ftl") + " " + "Success";
				} catch (Exception e) {
					return e.getMessage();
				}
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

	private static Connection getConnection2() {
		try {
			URI dbUri = new URI(System.getenv("JDBC_DATABASE_URL"));
		    String username = dbUri.getUserInfo().split(":")[0];
		    String password = dbUri.getUserInfo().split(":")[1];
		    String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ':' + dbUri.getPort() + dbUri.getPath();

	    return DriverManager.getConnection(dbUrl, username, password);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

}
