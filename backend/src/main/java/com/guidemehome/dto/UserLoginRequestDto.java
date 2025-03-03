package com.guidemehome.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(title = "UserLoginRequest")
public class UserLoginRequestDto {

	@NotBlank(message = "Email must not be empty")
	@Email(message = "Email must be of valid format")
	@Schema(requiredMode = RequiredMode.REQUIRED, example = "hardik.behl7444@gmail.com", description = "email-id associated with user account already created in the system")
	private String email;

	@NotBlank(message = "Password must not be empty")
	@Schema(requiredMode = RequiredMode.REQUIRED, example = "somethingSecure", description = "password corresponding to provided email-id")
	private String password;

}
