Add-Type -AssemblyName System.Drawing
function Render($name, $x, $y, $w) {
  $bmp = New-Object System.Drawing.Bitmap 200, 160
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.Color]::FromArgb(255, 12, 18, 16))
  $skin = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 243, 196, 156))
  $g.FillEllipse($skin, (100-26), (70-32), 52, 64)
  $hair = [System.Drawing.Image]::FromFile("C:\Users\ruska\Desktop\website_my_year\public\hero-hair-female.png")
  $g.DrawImage($hair, [single]$x, [single]$y, [single]$w, [single]$w)
  $g.Dispose(); $hair.Dispose(); $skin.Dispose()
  $gaps = 0
  for ($yy = 40; $yy -le 110; $yy++) {
    for ($xx = 70; $xx -le 145; $xx++) {
      $c = $bmp.GetPixel($xx, $yy)
      if ($c.R -gt 25 -or $c.G -gt 25) { continue }
      $skinN = $false; $hairN = $false
      foreach ($p in @(@(-3,0),@(3,0),@(0,-3),@(0,3),@(-5,0),@(5,0))) {
        $nx = $xx + $p[0]; $ny = $yy + $p[1]
        if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge 200 -or $ny -ge 160) { continue }
        $n = $bmp.GetPixel($nx, $ny)
        if ($n.R -gt 200 -and $n.G -gt 150) { $skinN = $true }
        elseif ($n.R -gt 140 -and $n.G -lt 130 -and $n.B -gt 80) { $hairN = $true }
      }
      if ($skinN -and $hairN) { $gaps++ }
    }
  }
  $bmp.Dispose()
  Write-Output "$name gaps=$gaps"
}
Render "e" 66.5 32 72.4
Render "f" 64 34 74
Render "g" 68 30 70
Render "h" 65 36 73
Render "b" 60 32 78
Render "c" 58 36 84
Render "d" 62 34 80
