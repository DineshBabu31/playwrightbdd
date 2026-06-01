Feature: API Testing

  Scenario: Create User using POST API

    Given the API request context is initialized

    When I send a POST request to create a user

    Then the API response status should be 201

    And the response should contain created user details