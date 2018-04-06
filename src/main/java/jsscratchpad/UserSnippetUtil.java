package jsscratchpad;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;

import javax.sql.DataSource;

public class UserSnippetUtil {

	public static void main(String[] args) {
		UserSnippetUtil.createTable();
	}
	
	public static void createTable() {
		DataSource dataSource = DatabaseUtil.getDatasource();
		try (Connection connection = dataSource.getConnection();
				Statement stmt = connection.createStatement()) {
//				stmt.execute("DROP TABLE IF EXISTS usersnippet;");
				stmt.execute("CREATE TABLE IF NOT EXISTS usersnippet("
						+ "id serial primary key, "
						+ "username VARCHAR(32) NOT NULL, "
						+ "title VARCHAR(50) NOT NULL, "
						+ "snippet TEXT NOT NULL,"
						+ "lastmodified TIMESTAMP NOT NULL);");
		} catch (Exception e) {
			e.printStackTrace();
		}
		UserSnippet o;
	}
	//get all snippet names for user
	public static ArrayList<UserSnippet> getAllSnippetInfoForUser(String username) {
		DataSource dataSource = DatabaseUtil.getDatasource();
		try (Connection connection = dataSource.getConnection();
				PreparedStatement ps = connection.prepareStatement(
						"SELECT id, title, lastmodified FROM usersnippet where username = ? order by lastmodified desc;");) {
			ps.setString(1, username);
			try(ResultSet rs = ps.executeQuery();) {
				ArrayList<UserSnippet> output = new ArrayList<UserSnippet>();
				while (rs.next()) {
					UserSnippet l = new UserSnippet();
					l.setId(Integer.parseInt(rs.getString("id")));
					l.setTitle(rs.getString("title"));
					l.setLastModified(rs.getTimestamp("lastmodified"));
					output.add(l);
				}
				return output;
			}
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}
	
	//save snippet for user
	
	//save as snippet for user
	public static Integer saveSnippetAsForUser(String username, String title, String snippet) {
		try (Connection connection = DatabaseUtil.getDatasource().getConnection();
				PreparedStatement ps = connection.prepareStatement(
						"INSERT INTO usersnippet"
						+ " (username, title, snippet, lastmodified)"
						+ " VALUES (?, ?, ?, ?) returning id;");) {
			
			ps.setString(1, username);
			ps.setString(2, title);
			ps.setString(3, snippet);
			ps.setTimestamp(4, Timestamp.valueOf(LocalDateTime.now()));
			try(ResultSet rs = ps.executeQuery();) {
				rs.next();
				return rs.getInt(1);
			}
		} catch (SQLException e) {
			e.printStackTrace();
			return -1;
		}
	}
	
	public static void updateSnippetForUser(Integer id, String username, String snippet) {
		try (Connection connection = DatabaseUtil.getDatasource().getConnection();
				PreparedStatement ps = connection.prepareStatement(
						"UPDATE usersnippet"
						+ " set snippet = ?, lastmodified = ?"
						+ " where id = ? and username = ?;");) {

			ps.setString(1, snippet);
			ps.setTimestamp(2, Timestamp.valueOf(LocalDateTime.now()));
			ps.setInt(3, id);
			ps.setString(4, username);
			ps.execute();
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	public static void deleteSnippetForUser(Integer id, String username) {
		try (Connection connection = DatabaseUtil.getDatasource().getConnection();
				PreparedStatement ps = connection.prepareStatement(
						"DELETE FROM usersnippet"
						+ " where id = ? and username = ?;");) {
			ps.setInt(1, id);
			ps.setString(2, username);
			ps.execute();
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	public static UserSnippet getSnippetForUser(Integer id, String username) {
		DataSource dataSource = DatabaseUtil.getDatasource();
		try (Connection connection = dataSource.getConnection();
				PreparedStatement ps = connection.prepareStatement(
						"SELECT * FROM usersnippet where username = ? and id = ?;");) {
			ps.setString(1, username);
			ps.setInt(2, id);
			try(ResultSet rs = ps.executeQuery();) {
				if (rs.next()) {
					UserSnippet l = new UserSnippet();
					l.setId(Integer.parseInt(rs.getString("id")));
					l.setTitle(rs.getString("title"));
					l.setSnippet(rs.getString("snippet"));
					l.setLastModified(rs.getTimestamp("lastmodified"));
					System.out.println(l);
					return l;
				}
				return null;
			}
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}
	
	public static boolean snippetTitleExistsForUser(String username, String title) {
		DataSource dataSource = DatabaseUtil.getDatasource();
		try (Connection connection = dataSource.getConnection();
				PreparedStatement ps = connection.prepareStatement(
						"SELECT * FROM usersnippet where username = ? and title = ?;");) {
			ps.setString(1, username);
			ps.setString(2, title);
			try(ResultSet rs = ps.executeQuery();) {
				return rs.isBeforeFirst();
			}
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}
	
//	public static ArrayList<UserSnippet> getAllUserSnippetsInfo() {
//		DataSource dataSource = DatabaseUtil.getDatasource();
//		try (Connection connection = dataSource.getConnection();
//				Statement stmt = connection.createStatement();
//				ResultSet rs = stmt.executeQuery("SELECT id, username, title, lastmodified FROM usersnippet;");) {
//			
//			ArrayList<UserSnippet> output = new ArrayList<UserSnippet>();
//			while (rs.next()) {
//				UserSnippet l = new UserSnippet();
//				l.setId(Integer.parseInt(rs.getString("id")));
//				l.setTitle(rs.getString("title"));
//				l.setUsername(rs.getString("username"));
//				l.setLastModified(rs.getTimestamp("lastmodified"));
//				output.add(l);
//			}
//			return output;
//		} catch (Exception e) {
//			e.printStackTrace();
//			return null;
//		}
//	}
	
}
