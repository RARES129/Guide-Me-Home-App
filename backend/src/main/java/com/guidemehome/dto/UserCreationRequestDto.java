package com.guidemehome.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(title = "UserCreationRequest")
public class UserCreationRequestDto {

	@NotBlank(message = "Email must not be empty")
	@Email(message = "Email must be of valid format")
	@Schema(requiredMode = RequiredMode.REQUIRED, description = "email of user", example = "hardik.behl7444@gmail.com")
	private String email;
	
	@NotBlank(message = "Password must not be empty")
	@Size(min = 6, message = "Password length must be 6 characters long")
	@Schema(requiredMode = RequiredMode.REQUIRED, description = "secure password to enable user login", example = "somethingSecure")
	private String password;

	@NotBlank(message = "Role must not be empty")
	@Pattern(regexp = "^(user|assistant)$", message = "Role must be either 'user' or 'assistant'")
	@Schema(requiredMode = RequiredMode.REQUIRED, description = "the role of the user", example = "user")
	private String role;

}