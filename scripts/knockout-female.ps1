Add-Type -AssemblyName System.Drawing
$src = New-Object System.Drawing.Bitmap "C:\Users\ruska\Desktop\website_my_year\public\hero-hair-female.png"
function IsSkin($c) {
  if ($c.A -lt 30) { return $false }
  return ($c.R -gt 175 -and $c.G -gt 135 -and $c.B -gt 80 -and $c.G -gt ($c.B + 15))
}
$minX = 9999; $minY = 9999; $maxX = 0; $maxY = 0
$sMinX = 9999; $sMinY = 9999; $sMaxX = 0; $sMaxY = 0
$bmp = New-Object System.Drawing.Bitmap $src.Width, $src.Height
for ($y = 0; $y -lt $src.Height; $y++) {
  for ($x = 0; $x -lt $src.Width; $x++) {
    $c = $src.GetPixel($x, $y)
    if (IsSkin $c) {
      $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
      if ($x -lt $sMinX) { $sMinX = $x }; if ($y -lt $sMinY) { $sMinY = $y }
      if ($x -gt $sMaxX) { $sMaxX = $x }; if ($y -gt $sMaxY) { $sMaxY = $y }
    } else {
      $bmp.SetPixel($x, $y, $c)
      if ($c.A -gt 40) {
        if ($x -lt $minX) { $minX = $x }; if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }; if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }
}
$tmp = "C:\Users\ruska\Desktop\website_my_year\public\hero-hair-female-cut.png"
$bmp.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "hair bounds $minX,$minY - $maxX,$maxY"
Write-Output "skin bounds $sMinX,$sMinY - $sMaxX,$sMaxY"
# skin outline rows
for ($y = $sMinY; $y -le $sMaxY; $y += 40) {
  $left = -1; $right = -1
  for ($x = 0; $x -lt $src.Width; $x += 2) {
    if (IsSkin ($src.GetPixel($x, $y))) {
      if ($left -lt 0) { $left = $x }
      $right = $x
    }
  }
  if ($left -ge 0) { Write-Output ("skin y={0} x={1}-{2}" -f $y, $left, $right) }
}
$bmp.Dispose(); $src.Dispose()
Move-Item -Force "C:\Users\ruska\Desktop\website_my_year\public\hero-hair-female-cut.png" "C:\Users\ruska\Desktop\website_my_year\public\hero-hair-female.png"
Write-Output "replaced female png"
