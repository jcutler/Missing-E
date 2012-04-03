<?php

mysql_connect("localhost", "ciw_missinge", "FAKEPASSWORD");
mysql_select_db("ciw_missinge");
mysql_query("UPDATE Downloads SET Count=Count+1 WHERE Browser='Safari'");

header('Location: http://missing-e.com/safari/missinge.safariextz');

?>
