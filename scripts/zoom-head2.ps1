Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Bitmap]::FromFile("c:\Users\ruska\AppData\Local\Temp\cursor\screenshots\page-2026-10-28T15-56-18-591Z.png")
$x0=300; $y0=70; $w=230; $h=250
$crop = New-Object System.Drawing.Bitmap ($w*3), ($h*3)
$g = [System.Drawing.Graphics]::FromImage($crop)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$g.DrawImage($src, (New-Object System.Drawing.Rectangle 0,0,($w*3),($h*3)), (New-Object System.Drawing.Rectangle $x0,$y0,$w,$h), [System.Drawing.GraphicsUnit]::Pixel)
$crop.Save("C:\Users\ruska\Desktop\website_my_year\scripts\head-zoom.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $crop.Dispose(); $src.Dispose()
Write-Output "ok"
