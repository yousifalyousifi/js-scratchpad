package jsscratchpad;

import java.net.URI;
import java.sql.Connection;
import java.sql.DriverManager;

import javax.sql.DataSource;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

public class DatabaseUtil {
	
	private static DataSource dataSource;

	public static DataSource getDatasource() {
		if(dataSource == null) {
			if(System.getenv("IS_LOCAL") != null &&
					System.getenv("IS_LOCAL").equalsIgnoreCase("true")) {
				System.err.println("Using Postgres DB from LOCAL");
				dataSource = getDataSourceForLocalEnv();
			} else {
				HikariConfig config = new HikariConfig();
				config.setJdbcUrl(System.getenv("JDBC_DATABASE_URL"));
				dataSource = (config.getJdbcUrl() != null) ? new HikariDataSource(config)
						: new HikariDataSource();
			}
		}
		return dataSource;
	}

	//I have to create the hikari datasource differently for local development, not sure why. 
	private static DataSource getDataSourceForLocalEnv() {
		try {
			DataSource dataSource;
			URI dbUri = new URI(System.getenv("JDBC_DATABASE_URL"));
		    String username = dbUri.getUserInfo().split(":")[0];
		    String password = dbUri.getUserInfo().split(":")[1];
		    String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ':' + dbUri.getPort() + dbUri.getPath();// + "?sslmode=require";
		    dbUrl = dbUrl + "?user=" + username + "&password=" + password + "&sslmode=require";
			HikariConfig config = new HikariConfig();
			config.setJdbcUrl(dbUrl);
			config.setDriverClassName("org.postgresql.Driver");
			config.setMaximumPoolSize(2);
			config.setPoolName("LocalHikariPool");
			dataSource = new HikariDataSource(config);
		    return dataSource;
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}
}
