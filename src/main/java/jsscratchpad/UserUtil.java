package jsscratchpad;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;

import javax.sql.DataSource;

public class UserUtil {

	public static void createTable() {
		DataSource dataSource = DatabaseUtil.getDatasource();
		try (Connection connection = dataSource.getConnection();
				Statement stmt = connection.createStatement()) {
				stmt.execute("DROP TABLE IF EXISTS users;");
				stmt.execute("CREATE TABLE users("
						+ "id serial primary key, "
						+ "username VARCHAR(32) NOT NULL, "
						+ "password VARCHAR(80) NOT NULL,"
						+ "creationdate TIMESTAMP NOT NULL,"
						+ "lastlogin TIMESTAMP);");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public static ArrayList<User> getAllUsers() {
		DataSource dataSource = DatabaseUtil.getDatasource();
		try (Connection connection = dataSource.getConnection();
				Statement stmt = connection.createStatement();
				ResultSet rs = stmt.executeQuery("SELECT * FROM users;");) {
			
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
			return null;
		}
	}
	
	public static boolean verify(String username, String password) {
		DataSource dataSource = DatabaseUtil.getDatasource();
		try (Connection connection = dataSource.getConnection();
				PreparedStatement ps = connection
						.prepareStatement("SELECT * FROM users where username = ?");) {

			ps.setString(1, username);
			
			try (ResultSet rs = ps.executeQuery();) {
				int count = 0;
				boolean valid = false;
				while (rs.next()) {
					valid = PasswordUtil.check(password, rs.getString("password"));
					count++;
					if(count>1) { //there should only be one result
						return false;
					}
				}
				
				if(!valid) {
					return false;
				}
			}

			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}
	
	public static boolean register(String username, String password) {
		DataSource dataSource = DatabaseUtil.getDatasource();
		try (Connection connection = dataSource.getConnection();
				PreparedStatement ps = connection
				.prepareStatement("SELECT * FROM users where username = ?");
				PreparedStatement ps2 = connection
				.prepareStatement("INSERT INTO users (username, password, creationdate) VALUES (?,?,?);");) {

			ps.setString(1, username);
			try (ResultSet rs = ps.executeQuery();) {
				if (rs.next()) {
					return false;
				};
				
				ps2.setString(1, username);
				ps2.setString(2, PasswordUtil.hashPassword(password));
				ps2.setTimestamp(3, Timestamp.valueOf(LocalDateTime.now()));
				ps2.executeUpdate();

				return true;
			}
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}

	}
}
