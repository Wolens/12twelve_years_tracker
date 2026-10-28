Add-Type -AssemblyName System.Drawing
$srcPath = "C:\Users\ruska\Desktop\website_my_year\public\hero-hair-duo.png"
$img = [System.Drawing.Bitmap]::FromFile($srcPath)
$bmp = New-Object System.Drawing.Bitmap $img.Width, $img.Height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::FromArgb(255, 30, 36, 32))
$g.DrawImage($img, 0, 0, $img.Width, $img.Height)
$out = "C:\Users\ruska\Desktop\website_my_year\scripts\hair-preview.png"
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose(); $img.Dispose()
Write-Output "saved $out"
