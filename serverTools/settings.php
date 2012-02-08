<?php

header("Content-Type: text/xml");
header("Cache-Control: public");
header("Access-Control-Allow-Origin: *");

if ($_FILES["import"]) {
   if ($_FILES["import"]["error"] == UPLOAD_ERR_OK &&
       is_uploaded_file($_FILES["import"]["tmp_name"])) {
      echo file_get_contents($_FILES["import"]["tmp_name"]);
   }
   if (is_file($_FILES["import"]["tmp_name"])) {
      unlink($_FILES["import"]["tmp_name"]);
   }
}
else {
   header("Content-Disposition: attachment; filename=settings.xml");
   echo "<?xml version=\"1.0\"?>\n";
   echo "<missing-e>\n";
   $patterns = array();
   $repl = array();
   
   $patterns[0] = "/&/";
   $patterns[1] = "/</";
   $patterns[2] = "/>/";
   
   $repl[0]     = "&amp;";
   $repl[1]     = "&lt;";
   $repl[2]     = "&gt;";
   
   foreach ($_GET as $key => $value) {
      echo "<setting>\n";
      echo "<name>" . $key . "</name>\n";
      echo "<value>" . preg_replace($patterns,$repl,$value) . "</value>\n";
      echo "</setting>\n";
   }
   
   echo "</missing-e>";
}
exit(0);
?>
