package ca.coderdojo.toronto;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class LessonsUtil {

	static String path = "lessons/";
	
	public static void createTable() {
		
		try (Connection connection = DatabaseUtil.getDatasource().getConnection()) {

			Statement stmt = connection.createStatement();
			stmt.execute("DROP TABLE IF EXISTS lessons;");
			stmt.execute("CREATE TABLE lessons("
					+ "id integer PRIMARY KEY, "
					+ "title VARCHAR(100) NOT NULL, "
					+ "snippet VARCHAR(5000) NOT NULL);");
			try {
				for (String filename : getResourceFiles(path)) {
					int separatorIndex = filename.indexOf('_');
					String title = filename.substring(separatorIndex+1, filename.length()-3);
					String[] parts = filename.split("_");
					String id = parts[0];
					String snippet = getResourceFile(path + filename);
					PreparedStatement ps = connection.prepareStatement("INSERT INTO lessons VALUES (?, ?, ?);");
					ps.setInt(1, Integer.parseInt(id));
					ps.setString(2, title);
					ps.setString(3, snippet);
					ps.execute();
				}
			} catch (IOException e) {
				e.printStackTrace();
			}
			
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	private static ArrayList<String> getFileNames() {
		return null;
	}

	public static void main(String[] args) {
		String path = "lessons/";
		try {
			System.out.println(Arrays.toString(getResourceFiles(path).toArray()));
			for (String filename : getResourceFiles(path)) {
				int separatorIndex = filename.indexOf('_');
				String title = filename.substring(separatorIndex+1, filename.length()-3);
				System.out.println(title);
				String[] parts = filename.split("_");
				String id = parts[0];
				System.out.println(id);
				System.out.println(getResourceFile(path + filename));
			}
			LessonsUtil.createTable();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private static String getResourceFile(String path) throws IOException {

		try (InputStream in = getResourceAsStream(path)) {
			ByteArrayOutputStream result = new ByteArrayOutputStream();
			byte[] buffer = new byte[1024];
			int length;
			while ((length = in.read(buffer)) != -1) {
				result.write(buffer, 0, length);
			}
			return result.toString("UTF-8");
		}
	}

	// http://stackoverflow.com/a/3923685/1987694
	private static List<String> getResourceFiles(String path) throws IOException {
		List<String> filenames = new ArrayList<>();

		try (InputStream in = getResourceAsStream(path);
				BufferedReader br = new BufferedReader(new InputStreamReader(in))) {
			String resource;

			while ((resource = br.readLine()) != null) {
				filenames.add(resource);
			}
		}

		return filenames;
	}

	private static InputStream getResourceAsStream(String resource) {
		final InputStream in = getContextClassLoader().getResourceAsStream(resource);

		return in == null ? LessonsUtil.class.getResourceAsStream(resource) : in;
	}

	private static ClassLoader getContextClassLoader() {
		return Thread.currentThread().getContextClassLoader();
	}
}
