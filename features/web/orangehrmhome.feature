Feature: OrangeHRM Employee Validation

  Scenario: Login and Navigate to PIM

    Given user Launch the browser "chromium" in maximized mode and navigate to the URL "https://opensource-demo.orangehrmlive.com/"

    When User enters username "Admin"
    And User enters password "admin123"
    And User clicks on Login button

    Then User should be navigated to the Dashboard page

    When User clicks on PIM menu

    Then User should be navigated to Employee Information page