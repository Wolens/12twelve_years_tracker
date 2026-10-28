Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Users\ruska\Desktop\website_my_year\public\hero-hair-female.png")
$bmp = New-Object System.Drawing.Bitmap 200, 220
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::FromArgb(255, 16, 22, 20))
$g.DrawImage($img, 20, -24, 160, 160)
$pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(180, 255, 80, 80), 1.5)
$g.DrawEllipse($pen, (100-32), (66-32), 64, 64)
$bmp.Save("C:\Users\ruska\Desktop\website_my_year\scripts\female-preview.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose(); $img.Dispose(); $pen.Dispose()
Write-Output "ok"
