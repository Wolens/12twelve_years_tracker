Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Bitmap]::FromFile("c:\Users\ruska\AppData\Local\Temp\cursor\screenshots\page-2026-10-28T15-56-18-591Z.png")
Write-Output "size $($src.Width)x$($src.Height)"
# find a skin-like pixel cluster (peach)
$minX=9999; $minY=9999; $maxX=0; $maxY=0; $n=0
for ($y=0; $y -lt $src.Height; $y+=2) {
  for ($x=0; $x -lt $src.Width; $x+=2) {
    $c = $src.GetPixel($x,$y)
    if ($c.R -gt 210 -and $c.G -gt 150 -and $c.G -lt 210 -and $c.B -gt 100 -and $c.B -lt 180) {
      $n++
      if ($x -lt $minX) { $minX=$x }
      if ($y -lt $minY) { $minY=$y }
      if ($x -gt $maxX) { $maxX=$x }
      if ($y -gt $maxY) { $maxY=$y }
    }
  }
}
Write-Output "skin n=$n bounds=$minX,$minY-$maxX,$maxY"
$pad = 40
$x0 = [Math]::Max(0, $minX-$pad)
$y0 = [Math]::Max(0, $minY-$pad)
$w = [Math]::Min($src.Width-$x0, ($maxX-$minX)+$pad*2)
$h = [Math]::Min($src.Height-$y0, ($maxY-$minY)+$pad*2)
$crop = New-Object System.Drawing.Bitmap ($w*3), ($h*3)
$g = [System.Drawing.Graphics]::FromImage($crop)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$g.DrawImage($src, (New-Object System.Drawing.Rectangle 0,0,($w*3),($h*3)), (New-Object System.Drawing.Rectangle $x0,$y0,$w,$h), [System.Drawing.GraphicsUnit]::Pixel)
$crop.Save("C:\Users\ruska\Desktop\website_my_year\scripts\head-zoom.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $crop.Dispose(); $src.Dispose()
Write-Output "zoomed"
