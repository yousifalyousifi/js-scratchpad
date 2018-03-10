package jsscratchpad;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

@WebSocket
public class CanvasViewer {

    private static final Queue<Session> viewers = new ConcurrentLinkedQueue<>();
    private static final Map<String, String> sketches = new ConcurrentHashMap<>();
    private static final Map<String, Long> lastUpdated = new ConcurrentHashMap<>();

    public static final String KEEP_ALIVE = "KEEP_ALIVE";
    public static final String DELETE_ALL = "DELETE_ALL";
    private static class Message {String type; String data;}

    @OnWebSocketConnect
    public void connected(Session session) {
        System.out.println("Viewer opened socket.");
        viewers.add(session);

    	Gson gson = new GsonBuilder().create();
    	try {
			session.getRemote().sendString(gson.toJson(sketches.keySet()));
		} catch (IOException e) {
			e.printStackTrace();
		}
    }

    @OnWebSocketClose
    public void closed(Session session, int statusCode, String reason) {
        System.out.println("Viewer closed socket.");
        viewers.remove(session);
    }

    @OnWebSocketMessage
    public void message(Session session, String message) throws IOException {
    	Gson gson = new GsonBuilder().create();
    	Message m = gson.fromJson(message, Message.class);
    	if(m.type.equals(KEEP_ALIVE)) {
    		//do nothing
    	} else if(m.type.equals(DELETE_ALL)) {
    		deleteAll();
    	}
    }

    public void putCode(String id, String code) {
    	sketches.put(id, code);
    	lastUpdated.put(id, System.currentTimeMillis());
    	Iterator<Session> iter = viewers.iterator();
    	Gson gson = new GsonBuilder().create();
    	
    	List<String> ids = new ArrayList<String>();
    	ids.add(id);
    	
    	while(iter.hasNext()) {
    		Session s = iter.next();
    		try {
    			s.getRemote().sendString(gson.toJson(ids));
			} catch (IOException e) {
				e.printStackTrace();
			}
    	}
    }

    public String getCode(String id) {
    	return sketches.get(id);
    }

    public int deleteAll() {
    	int size = sketches.size();
		sketches.clear();
		lastUpdated.clear();
		return size;
    }
}
