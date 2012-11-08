module 'coffee-script'

test 'including compiled global coffee library', ->
  ok global_coffee_lib?, 'global lib compiled and global_coffee_lib is exists'
  ok global_coffee_lib(), 'global_coffee_lib is executable'
  
test 'including compiled local coffee library', ->
  ok local_coffee_lib?, 'local lib compiled and local_coffee_lib is exists'
  ok local_coffee_lib(), 'local_coffee_lib is executable'