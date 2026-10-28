Add-Type -AssemblyName System.Drawing
$hair = [System.Drawing.Image]::FromFile("C:\Users\ruska\Desktop\website_my_year\public\hero-hair-male.png")
$bmp = New-Object System.Drawing.Bitmap 200, 220
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::FromArgb(255, 18, 22, 20))
$skin = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 232, 196, 160))
$g.FillEllipse($skin, (100-32), (66-32), 64, 64)
$g.DrawImage($hair, 56, 6, 87, 78)
$bmp.Save("C:\Users\ruska\Desktop\website_my_year\scripts\hair-on-head.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose(); $hair.Dispose(); $skin.Dispose()
Write-Output "ok"
