package jsscratchpad;

import java.util.UUID;

import com.lambdaworks.crypto.SCryptUtil;

public class PasswordUtil {
	
	public static String hashPassword(String password) {
		return SCryptUtil.scrypt(password, (int)Math.pow(2, 14), 8, 1);
	}
	
	public static boolean check(String password, String hashed) {
		return SCryptUtil.check(password, hashed);
	}
	
	public static void main(String[] args) {
		System.out.println(hashPassword(UUID.randomUUID().toString()));
		System.out.println(hashPassword(UUID.randomUUID().toString()));
		System.out.println(hashPassword(UUID.randomUUID().toString()));
		System.out.println(hashPassword(UUID.randomUUID().toString()));
		System.out.println(hashPassword(UUID.randomUUID().toString()));
		System.out.println(hashPassword(UUID.randomUUID().toString()));
		System.out.println(hashPassword(UUID.randomUUID().toString()));
		System.out.println(hashPassword(UUID.randomUUID().toString()));
		System.out.println(hashPassword(UUID.randomUUID().toString()));
		System.out.println(hashPassword(UUID.randomUUID().toString()));
		System.out.println(hashPassword(UUID.randomUUID().toString()));
		System.out.println(hashPassword(UUID.randomUUID().toString()));
		System.out.println(hashPassword(UUID.randomUUID().toString()));
	}

}
