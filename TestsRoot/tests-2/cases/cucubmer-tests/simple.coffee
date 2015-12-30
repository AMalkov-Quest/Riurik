Spec '''
Feature: Simple maths
  In order to do maths
  As a developer
  I want to increment variables

  Scenario: easy maths
    Given a variable set to 1
    When I increment the variable by 1
    Then the variable should contain 2

  Scenario: much more complex stuff
    Given a variable set to 100
    When I increment the variable by 6
    Then the variable should contain 1061
'''

World ->
  @variable = 0

Given /^a variable set to (\d+)$/, (number, callback)->
  @variable = parseInt(number)
  callback()


When /^I increment the variable by (\d+)$/, (number, callback)->
  @variable += parseInt(number)
  callback()


Then /^the variable should contain (\d+)$/, (number, callback)->
  equal @variable, parseInt(number), "Variable should contain #{number} but it contains #{@variable}."
  callback()
