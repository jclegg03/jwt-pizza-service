### Attack 1
| Franchise Killer           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 6, 2026                                                                  |
| Target         | pizza.jays-jwt-pizza.click                                                       |
| Classification | Broken Access Control                                                                      |
| Severity       | 0 (would be 1 if we hadn't fixed this already.)                                                                              |
| Description    | Removes all franchises removing the ability to buy pizzas             |
| Images         | ![No stores](franchiseKiller.png) <br/> Stores and menu no longer accessible. |
| Corrections    | Check auth before allowing franchise deletion.

### Attack 2
| Admin Havoc           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 6, 2026                                                                  |
| Target         | pizza.jays-jwt-pizza.click                                                       |
| Classification | Security Misconfiguration                                                                 |
| Severity       | 0 (would be 4 if we hadn't fixed this already.)                                                                              |
| Description    | Removes all franchises removing the ability to buy pizzas. Also steals all users information and deletes all users.             |
| Images         | ![Admin Stolen](adminHavoc.png) <br/> Stolen User info |
| Corrections    | Change default admin password. Even better: have secure admin password.


### Attack 3
| Nasty SQL           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 6, 2026                                                                  |
| Target         | pizza.jays-jwt-pizza.click                                                       |
| Classification | Injection                                                                |
| Severity       | 4                                                                           |
| Description    | Steals all user's emails and the original hashed passwords. Then it sets everyone's password to the latest special secret password.            |
| Images         | ![Gross SQL](nastySQL.png) <br/> Stolen User info |
| Corrections    | Fix SQL injection in updating user data.
