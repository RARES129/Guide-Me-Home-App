package com.guidemehome.filter;

import java.util.Optional;

import com.guidemehome.utility.ApiEndpointSecurityInspector;
import org.apache.commons.lang3.StringUtils;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.google.firebase.auth.FirebaseAuth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final FirebaseAuth firebaseAuth;
	private final ApiEndpointSecurityInspector apiEndpointSecurityInspector;

	private static final String AUTHORIZATION_HEADER = "Authorization";
	private static final String BEARER_PREFIX = "Bearer ";
	private static final String USER_ID_CLAIM = "user_id";

	@Override
	@SneakyThrows
	protected void doFilterInternal(
			@NonNull HttpServletRequest request,
			@NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) {
		final var unsecuredApiBeingInvoked = apiEndpointSecurityInspector.isUnsecureRequest(request);

		if (Boolean.FALSE.equals(unsecuredApiBeingInvoked)) {
			final var authorizationHeader = request.getHeader(AUTHORIZATION_HEADER);

			if (StringUtils.isNotEmpty(authorizationHeader) && authorizationHeader.startsWith(BEARER_PREFIX)) {
				final var token = authorizationHeader.replace(BEARER_PREFIX, StringUtils.EMPTY);
				final var firebaseToken = firebaseAuth.verifyIdToken(token);
				final var userId = Optional.ofNullable(firebaseToken.getClaims().get(USER_ID_CLAIM)).orElseThrow(IllegalStateException::new);

				final var authentication = new UsernamePasswordAuthenticationToken(userId, null, null);
				authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
				SecurityContextHolder.getContext().setAuthentication(authentication);
			}
		}
		filterChain.doFilter(request, response);
	}

}