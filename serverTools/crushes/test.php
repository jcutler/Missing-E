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

if (!isset($_GET['whoami']) || $_GET['whoami'] != "jeremycutler")
   die();

if (isset($_GET['large'])) {
   $avSize = 128;
   $avCrop = 128;
   $large = true;
}
else {
   $avSize = 96;
   $avCrop = 70;
   $large = false;
}

$curlHandle = curl_multi_init();

for ($i=0; $i<9; $i++) {
   $prefix = "";
   if (preg_match('/^images\/default_avatar/',$_GET["img" . $i]) != 0) {
      $prefix = "http://www.tumblr.com/";
   }
   else if (preg_match('/^http/',$_GET["img" . $i]) == 0) {
      $prefix = "http://media.tumblr.com/";
   }
   $crushes[] = $prefix . preg_replace('/[0-9]*\.(png|jpg|gif|jpeg)$/i',"$avSize.$1",$_GET["img" . $i]);
   $crushpercent[] = $_GET["per" . $i] . "%";
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
     $tmpfile = tempnam("/tmp", "FOO");
     file_put_contents($tmpfile, $txt[$i]);
     exec("convert -size 128x128 " . $tmpfile . " " . $tmpfile . ".jpg");
     $tmp = imagecreatefromjpeg($tmpfile . ".jpg");
     unlink($tmpfile);
     unlink($tmpfile . ".jpg");
   }
   else {
      $tmp = imagecreatefromstring($txt[$i]);
   }

   $cimg[$i] = imagecreatetruecolor($avCrop,$avCrop);
   imagecopyresampled($cimg[$i],$tmp,0,0,($avSize-$avCrop)/2,($avSize-$avCrop)/2,$avCrop,$avCrop,$avCrop,$avCrop);
   imagedestroy($tmp);
}

$offset = $large ? 17 : 12;
$img = imagecreatetruecolor($avCrop*3+$offset*2,$avCrop*3+$offset*2);
$bl = imagecolorallocatealpha($img, 0, 0, 0, 60);
$wh = imagecolorallocate($img, 255, 255, 255);
imagefilledrectangle($img, 0, 0, $avCrop*3+$offset*2, $avCrop*3+$offset*2, $wh);

if ($large) {
   $overlay['w'] = 44;
   $overlay['h'] = 24;
   $overlay['font'] = 5;
}
else {
   $overlay['w'] = 28;
   $overlay['h'] = 16;
   $overlay['font'] = 2;
}

for ($i=0; $i<9; $i++) {
   $x = ($i%3)*$avCrop+$offset;
   $y = ($i-$i%3)/3*$avCrop+$offset;
   imagecopy($img, $cimg[$i], ($i%3)*$avCrop+$offset, ($i-$i%3)/3*$avCrop+$offset, 0, 0, $avCrop, $avCrop);
   if ($i!=8)imagedestroy($cimg[$i]);
   if(isset($_GET['showPercent'])) {
      imagefilledrectangle($img, $x+$avCrop-$overlay['w'], $y+$avCrop-$overlay['h'], $x+$avCrop, $y+$avCrop, $bl);
      $twidth = imagefontwidth($overlay['font'])*strlen($crushpercent[$i]);
      $tx = $x+$avCrop-$overlay['w']/2-(ceil($twidth/2));
      $ty = $y+$avCrop-$overlay['h']/2-(ceil(imagefontheight($overlay['font'])/2));
      imagestring($img, $overlay['font'], $tx, $ty, $crushpercent[$i], $wh);
   }
}

$tmp=imagecreatetruecolor($avCrop*3+$offset*2,$avCrop*3+$offset*2);
$twh = imagecolorallocate($tmp,255,255,255);
$ttr = imagecolorallocate($tmp,0,0,0);
$radius = $large?13:10;
imagefilledrectangle($tmp, 0, 0, $avCrop*3+$offset*2, $avCrop*3+$offset*2, $twh);
imagefilledrectangle($tmp, $offset+$radius, $offset, $offset+$avCrop*3-$radius-1, $offset+$avCrop*3-1, $ttr);
imagefilledrectangle($tmp, $offset, $offset+$radius, $offset+$avCrop*3-1, $offset+$avCrop*3-$radius-1, $ttr);
imagefilledellipse($tmp,$offset+$radius,$offset+$radius,$radius*2,$radius*2, $ttr);
imagefilledellipse($tmp,$offset+$avCrop*3-$radius-1,$offset+$radius,$radius*2,$radius*2, $ttr);
imagefilledellipse($tmp,$offset+$avCrop*3-$radius-1,$offset+$avCrop*3-$radius-1,$radius*2,$radius*2, $ttr);
imagefilledellipse($tmp,$offset+$radius,$offset+$avCrop*3-$radius-1,$radius*2,$radius*2, $ttr);
imagecolortransparent($tmp,$ttr);
imagecopymerge($img, $tmp, 0, 0, 0, 0, $avCrop*3+$offset*2, $avCrop*3+$offset*2, 100);
imagecolordeallocate($tmp, $twh);
imagecolordeallocate($tmp, $ttr);
imagedestroy($tmp);

if ($large) {
   $heart = imagecreatefrompng('heart_large.png');
}
else {
   $heart = imagecreatefrompng('heart_small.png');
}
imagecopy($img,$heart,0,0,0,0,$large?59:40,$large?56:38);
imagedestroy($heart);

/*
header("Cache-Control: public");
header("Content-Description: File Transfer");
header("Content-Disposition: attachment; filename=crushes.png");
*/

if (isset($_GET["format"]) && preg_match("/^png$/i",$_GET["format"]) == 1) {
   header('Content-type: image/png');
   imagepng($img);
}
else {
   $quality = 80;
   if (isset($_GET["quality"])) {
      $val = (int)$_GET["quality"];
      if ($val >= 0 && $val <= 100)
         $quality = $val;
   }
   header('Content-type: image/jpeg');
   imagejpeg($img, NULL, $quality);
}

imagecolordeallocate($img, $wh);
imagecolordeallocate($img, $bl);

imagedestroy($img);

?>
