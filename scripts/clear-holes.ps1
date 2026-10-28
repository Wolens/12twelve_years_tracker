Add-Type -AssemblyName System.Drawing
function Clear($path, $mode) {
  $bmp = [System.Drawing.Bitmap]::FromFile($path)
  $rect = New-Object System.Drawing.Rectangle 0, 0, $bmp.Width, $bmp.Height
  $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $bytes = $data.Stride * $bmp.Height
  $buf = New-Object byte[] $bytes
  [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $buf, 0, $bytes)
  $n = 0
  for ($i = 0; $i -lt $bytes; $i += 4) {
    $b = $buf[$i]; $g = $buf[$i+1]; $r = $buf[$i+2]; $a = $buf[$i+3]
    if ($a -lt 10) { continue }
    $hit = $false
    if ($mode -eq "black") { $hit = ($r -lt 18 -and $g -lt 18 -and $b -lt 18) }
    else { $hit = ($r -gt 248 -and $g -gt 248 -and $b -gt 248) }
    if ($hit) { $buf[$i+3] = 0; $n++ }
  }
  [System.Runtime.InteropServices.Marshal]::Copy($buf, 0, $data.Scan0, $bytes)
  $bmp.UnlockBits($data)
  $tmp = $path + ".tmp.png"
  $bmp.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Move-Item -Force $tmp $path
  Write-Output "$mode cleared $n"
}
Clear "C:\Users\ruska\Desktop\website_my_year\public\hero-2d-male.png" "black"
Clear "C:\Users\ruska\Desktop\website_my_year\public\hero-2d-female.png" "white"
