package jsscratchpad;

import java.net.URI;
import java.sql.Connection;
import java.sql.DriverManager;

import javax.sql.DataSource;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

public class DatabaseUtil {

	public static DataSource getDatasource() {
		DataSource dataSource;
		if(System.getenv("IS_LOCAL") != null &&
				System.getenv("IS_LOCAL").equalsIgnoreCase("true")) {
			System.err.println("Using Postgres DB from LOCAL");
			dataSource = new MyDataSource();
		} else {
			HikariConfig config = new HikariConfig();
			config.setJdbcUrl(System.getenv("JDBC_DATABASE_URL"));
			dataSource = (config.getJdbcUrl() != null) ? new HikariDataSource(config)
					: new HikariDataSource();
		}
		return dataSource;
	}

	static class MyDataSource extends HikariDataSource {
		public Connection getConnection() {
			return getConnection2();
		}
	}

	private static Connection getConnection2() {
		try {
			URI dbUri = new URI(System.getenv("JDBC_DATABASE_URL"));
		    String username = dbUri.getUserInfo().split(":")[0];
		    String password = dbUri.getUserInfo().split(":")[1];
		    String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ':' + dbUri.getPort() + dbUri.getPath() + "?sslmode=require";

		    return DriverManager.getConnection(dbUrl, username, password);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}
}
