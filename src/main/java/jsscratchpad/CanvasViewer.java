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

    @OnWebSocketConnect
    public void connected(Session session) {
        System.out.println("connected");
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
        System.out.println("closed");
        viewers.remove(session);
    }

    @OnWebSocketMessage
    public void message(Session session, String message) throws IOException {
        System.out.println("Got: " + message);
        session.getRemote().sendString(message);
    }

    public void putCode(String id, String code) {
    	sketches.put(id, code);
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

}
