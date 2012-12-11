Feature: Create directory
    In order to organize and structure test cases Riurik provides the directories creation service.
    These directories can be used as test suites.

  Scenario:
    Given it is necessary to create the folder-for-tests suite in the riurik directory index
    When user is on the front-page
    Then he dose not see the given folder
      But he sees the Create Suite link
    When the link is pushed
    Then the user sees the Create Suite dialog
    When he types given folder name
      And press the create button
    Then new folder should be created