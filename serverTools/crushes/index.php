<?php

function addHandle(&$curlHandle,$url) {
   $cURL = curl_init();
   curl_setopt($cURL, CURLOPT_URL, $url);
   curl_setopt($cURL, CURLOPT_HEADER, 0);
   curl_setopt($cURL, CURLOPT_RETURNTRANSFER, 1);
   curl_multi_add_handle($curlHandle,$cURL);
   return $cURL;
}

function ExecHandle(&$curlHandle) {
   $flag=null;
   do {
      curl_multi_exec($curlHandle,$flag);
   } while($flag > 0);
}

if (isset($_GET['large'])) {
   $avSize = 128;
   $avCrop = 128;
   $large = true;
}
else {
   $avSize = 64;
   $avCrop = 64;
   $large = false;
}

$curlHandle = curl_multi_init();

for ($i=0; $i<9; $i++) {
   $prefix = "";
   if (!isset($_GET["img" . $i])) {
      die();
   }
   if (preg_match('/^images\/default_avatar/',$_GET["img" . $i]) != 0) {
      $prefix = "http://www.tumblr.com/";
   }
   else if (preg_match('/^http/',$_GET["img" . $i]) == 0) {
      $prefix = "http://media.tumblr.com/";
   }
   $crushes[] = $prefix . preg_replace('/[0-9]*\.(png|jpg|gif|jpeg)$/i',"$avSize.$1",$_GET["img" . $i]);
   if (isset($_GET["per" . $i])) {
      $crushpercent[] = $_GET["per" . $i] . "%";
   }
   else {
      $crushpercent[] = "";
   }
}

for ($i=0; $i<9; $i++) {
   $curl[$i] = addHandle($curlHandle,$crushes[$i]);
}
ExecHandle($curlHandle);
for ($i=0; $i<9; $i++) {
   $txt[$i] = curl_multi_getcontent($curl[$i]);
}
for ($i=0; $i<9; $i++) {
   curl_multi_remove_handle($curlHandle, $curl[$i]);
}
curl_multi_close($curlHandle);

for ($i=0; $i<9; $i++) {
   if (preg_match('/\.png$/i',$crushes[$i]) == 1 &&
       ord(substr($txt[$i],25)) == 4) {
     $tmpfile = tempnam("/tmp", "CIW");
     file_put_contents($tmpfile, $txt[$i]);
     exec("convert -size 128x128 " . $tmpfile . " " . $tmpfile . ".jpg");
     $tmp = imagecreatefromjpeg($tmpfile . ".jpg");
     unlink($tmpfile);
     unlink($tmpfile . ".jpg");
   }
   else {
      $tmp = imagecreatefromstring($txt[$i]);
   }

   $cimg[$i] = $tmp;
}

$offset = 10;
$dim = $avCrop*3+$offset*4;
$img = imagecreatetruecolor($dim,$dim);
$wh = imagecolorallocate($img, 255, 255, 255);
$bl = imagecolorallocatealpha($img, 0, 0, 0, 95);
imagefill($img, 0, 0, $wh);
imagefilledrectangle($img, 0, 0, $dim, $dim, $bl);

if ($large) {
   $overlay['w'] = 44;
   $overlay['h'] = 22;
   $overlay['font'] = 5;
}
else {
   $overlay['w'] = 28;
   $overlay['h'] = 14;
   $overlay['font'] = 2;
}

for ($i=0; $i<9; $i++) {
   $x = ($i%3)*($avCrop+$offset)+$offset;
   $y = ($i-$i%3)/3*($avCrop+$offset)+$offset;
   imagecopy($img, $cimg[$i], $x, $y, 0, 0, $avCrop, $avCrop);
   imagedestroy($cimg[$i]);
}

if ($large) {
   $froverlay = imagecreatefrompng('overlay_large.png');
   $peroverlay = imagecreatefrompng('percentoverlay_large.png');
}
else {
   $froverlay = imagecreatefrompng('overlay_small.png');
   $peroverlay = imagecreatefrompng('percentoverlay_small.png');
}
imagecopy($img,$froverlay,0,0,0,0,$large?424:232,$large?424:232);
if(isset($_GET['showPercent'])) {
   imagecopy($img,$peroverlay,0,0,0,0,$large?424:232,$large?424:232);
   for ($i=0; $i<9; $i++) {
      $x = ($i%3)*($avCrop+$offset)+$offset;
      $y = ($i-$i%3)/3*($avCrop+$offset)+$offset;
      $xoff = $large ? 5 : 2;
      $yoff = $large ? 6 : 3;
      $twidth = imagefontwidth($overlay['font'])*strlen($crushpercent[$i]);
      $tx = $x+$avCrop-$overlay['w']/2-(ceil($twidth/2))-$xoff;
      $ty = $y+$avCrop-$overlay['h']/2-(ceil(imagefontheight($overlay['font'])/2))-$yoff;
      imagestring($img, $overlay['font'], $tx, $ty, $crushpercent[$i], $wh);
   }
}
imagedestroy($froverlay);
imagedestroy($peroverlay);

/*
header("Cache-Control: public");
header("Content-Description: File Transfer");
header("Content-Disposition: attachment; filename=crushes.png");
*/

header('Content-type: image/jpeg');
imagejpeg($img, NULL, 80);

imagecolordeallocate($img, $wh);
imagecolordeallocate($img, $bl);
imagedestroy($img);

?>
