Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 200, 160
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::FromArgb(255, 12, 18, 16))
$skin = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 243, 196, 156))
$g.FillEllipse($skin, (100-26), (70-32), 52, 64)
$hair = [System.Drawing.Image]::FromFile("C:\Users\ruska\Desktop\website_my_year\public\hero-hair-female.png")
$g.DrawImage($hair, 66.5, 27, 72.4, 72.4)
$bmp.Save("C:\Users\ruska\Desktop\website_my_year\scripts\fit-female.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose(); $hair.Dispose(); $skin.Dispose()
Write-Output "ok"
