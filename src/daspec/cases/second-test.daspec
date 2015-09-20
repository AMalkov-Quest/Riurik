# Product availability problem handling

> We want to capture customer orders even when products are not in stock. This is
> useful for improving system performance -- as we can avoid inventory checks
> every time items are added to a shopping cart. It's also useful for business,
> because we capture customer needs to alert out purchasing department about
> potentially interesting customer trends. Finally, it's useful from a security
> perspective, as we can avoid malicious scripts and users locking out our entire
> inventory just by adding items to carts.  On the other hand, not reserving an
> item when a user adds it to a cart means that we have to handle situations when
> an order is paid, goes to delivery, and the items cannot be shipped. We want to
> ship the order partially to users, and ensure that our packaging people do not
> waste precious time looking for items that simply are not available. Finally,
> the part of the order that couldn't be shipped has to be put into an exception
> queue for post-processing. 

Assuming the following inventory:


| Item                                   | Quantity |
|----------------------------------------|----------|
| Fifty Quick Ideas To Improve Your Tests|       20 |
| Impact Mapping                         |        1 |
| Specification by Example               |        0 |

When a customer order with the following items is processed:

| Item                                    | Quantity |
|-----------------------------------------|----------|
| Specification by Example                | 4        |
| Impact Mapping                          | 3        |
| Fifty Quick Ideas To Improve Your Tests | 5        | 

The following items will be shipped:

| Item                                    | Quantity |
|-----------------------------------------|----------|
| Impact Mapping                          | 1        |
| Fifty Quick Ideas To Improve Your Tests | 5        | 

The following items will be added to the exception queue:

| Item                                    | Quantity |
|-----------------------------------------|----------|
| Specification by Example                | 4        |
| Impact Mapping                          | 2        |
