Feature: API Testing with OAuth2 and Complex JSON

  Background:
    Given the API request context is initialized

  # -------------------- OAUTH2 GRANTS --------------------

  Scenario: Obtain OAuth2 token using client credentials
    When I request an OAuth2 token using client credentials
    Then the API response status should be 200
    And the OAuth2 access token should be present

  Scenario: Obtain OAuth2 token using authorization code
    When I request an OAuth2 token using authorization code
    Then the API response status should be 200
    And the OAuth2 access token should be present

  Scenario: Obtain OAuth2 token using password grant
    When I request an OAuth2 token using password grant
    Then the API response status should be 200
    And the OAuth2 access token should be present

  Scenario: Obtain OAuth2 token using refresh token
    Given I already have a valid refresh token
    When I request a new OAuth2 token using refresh token
    Then the API response status should be 200
    And the OAuth2 access token should be present

  # -------------------- COMPLEX JSON PAYLOAD --------------------

  Scenario: Send POST request with complex nested JSON payload
    Given I have a valid OAuth2 access token
    When I send a POST request with complex nested JSON payload
    Then the API response status should be 201
    And the response should contain expected nested JSON values
