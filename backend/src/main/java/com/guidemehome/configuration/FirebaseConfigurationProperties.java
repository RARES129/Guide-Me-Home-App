package com.guidemehome.configuration;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "com.guidemehome")
public class FirebaseConfigurationProperties {

	@Valid
	private FireBase firebase = new FireBase();

	private Dotenv dotenv;

	@PostConstruct
	public void init() {
		dotenv = Dotenv.load();
		firebase.setWebApiKey(dotenv.get("FIREBASE_WEBAPI_KEY"));
	}

	@Getter
	@Setter
	public static class FireBase {

		@NotBlank(message = "Firestore service account file path must be configured")
		private String serviceAccountFilePath;

		private String webApiKey;
		
	}

}