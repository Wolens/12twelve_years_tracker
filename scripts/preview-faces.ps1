Add-Type -AssemblyName System.Drawing
function Preview($name, $hairPath, $x, $y, $w, $h, $face) {
  $hair = [System.Drawing.Image]::FromFile($hairPath)
  $bmp = New-Object System.Drawing.Bitmap 220, 240
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.Color]::FromArgb(255, 14, 20, 18))
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 243, 196, 156))
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddClosedCurve($face)
  $g.FillPath($brush, $path)
  $g.DrawImage($hair, $x, $y, $w, $h)
  $out = "C:\Users\ruska\Desktop\website_my_year\scripts\$name.png"
  $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose(); $hair.Dispose(); $brush.Dispose(); $path.Dispose()
  Write-Output $out
}
$male = @(
  (New-Object System.Drawing.PointF 68,45),
  (New-Object System.Drawing.PointF 64,70),
  (New-Object System.Drawing.PointF 65,82),
  (New-Object System.Drawing.PointF 78,101),
  (New-Object System.Drawing.PointF 100,104),
  (New-Object System.Drawing.PointF 122,101),
  (New-Object System.Drawing.PointF 135,82),
  (New-Object System.Drawing.PointF 136,70),
  (New-Object System.Drawing.PointF 132,45),
  (New-Object System.Drawing.PointF 100,39)
)
Preview "prev-male" "C:\Users\ruska\Desktop\website_my_year\public\hero-hair-male.png" 56 6 87 78 $male
$female = @(
  (New-Object System.Drawing.PointF 76,47),
  (New-Object System.Drawing.PointF 66,66),
  (New-Object System.Drawing.PointF 65,80),
  (New-Object System.Drawing.PointF 74,99),
  (New-Object System.Drawing.PointF 100,106),
  (New-Object System.Drawing.PointF 130,99),
  (New-Object System.Drawing.PointF 141,78),
  (New-Object System.Drawing.PointF 134,54),
  (New-Object System.Drawing.PointF 120,47),
  (New-Object System.Drawing.PointF 96,42)
)
Preview "prev-female" "C:\Users\ruska\Desktop\website_my_year\public\hero-hair-female.png" 44.5 13 120 120 $female
