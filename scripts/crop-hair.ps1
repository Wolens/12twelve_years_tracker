Add-Type -AssemblyName System.Drawing
$src = Join-Path $PSScriptRoot "..\public\hero-hair-duo.png"
$out = Join-Path $PSScriptRoot "..\public\hero-hair-male.png"
$img = [System.Drawing.Image]::FromFile($src)
$w = [int]($img.Width / 2)
$h = $img.Height
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
$srcRect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
$dstRect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
$g.DrawImage($img, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
$img.Dispose()
Write-Output "saved $out ${w}x${h}"
