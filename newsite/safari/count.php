<?php

mysql_connect("localhost", "ciw_missinge", "FAKEPASSWORD");
mysql_select_db("ciw_missinge");
$result = mysql_query("SELECT Count FROM Downloads WHERE Browser='Safari'");
$arr = mysql_fetch_array($result);
echo($arr["Count"]);

?>
