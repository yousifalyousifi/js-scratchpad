package ca.coderdojo.toronto;
import static spark.Spark.get;
import static spark.Spark.port;
import static spark.Spark.stop;
import static spark.Spark.init;
import static spark.Spark.staticFiles;
import static spark.Spark.staticFileLocation;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import spark.ModelAndView;
import spark.route.RouteOverview;
import spark.template.freemarker.FreeMarkerEngine;

public class Main {

	public static void main(String[] args) {
		try {
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

			get("/nashorn", (req, res) -> {
				ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
				String input = "var fun1 = function() { return 'hahahahaha NASHORN'; };";
				engine.eval(input);
				Invocable invocable = (Invocable) engine;

				Object result = invocable.invokeFunction("fun1");
				return result.toString();
			});

		} catch (Throwable e) {
			e.printStackTrace();
		}
	}

	public static void stopServer() {
		stop();
	}

}
