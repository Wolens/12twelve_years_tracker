Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Drawing.Drawing2D

function GapCount($label, $hairFile, $ox, $oy, $ow, $oh, $beziers) {
  $bmp = New-Object System.Drawing.Bitmap 200, 160
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.Color]::FromArgb(255, 10, 14, 12))
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  foreach ($b in $beziers) {
    $path.AddBezier($b[0], $b[1], $b[2], $b[3])
  }
  $path.CloseFigure()
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 243, 196, 156))
  $g.FillPath($brush, $path)
  $hair = [System.Drawing.Image]::FromFile($hairFile)
  $g.DrawImage($hair, [single]$ox, [single]$oy, [single]$ow, [single]$oh)
  $g.Dispose(); $hair.Dispose(); $brush.Dispose(); $path.Dispose()
  $gaps = 0
  for ($y = 30; $y -le 110; $y++) {
    for ($x = 40; $x -le 160; $x++) {
      $c = $bmp.GetPixel($x, $y)
      if ($c.R -gt 30 -or $c.G -gt 30) { continue }
      $nearSkin = $false; $nearHair = $false
      foreach ($dy in -3,-2,-1,1,2,3) {
        foreach ($dx in -4,-2,2,4) {
          $xx = $x + $dx; $yy = $y + $dy
          if ($xx -lt 0 -or $yy -lt 0 -or $xx -ge 200 -or $yy -ge 160) { continue }
          $n = $bmp.GetPixel($xx, $yy)
          if ($n.R -gt 200 -and $n.G -gt 150) { $nearSkin = $true }
          elseif ($n.R -gt 80 -and $n.G -lt 160 -and $n.A -gt 200) { $nearHair = $true }
        }
      }
      if ($nearSkin -and $nearHair) { $gaps++ }
    }
  }
  $bmp.Save("C:\Users\ruska\Desktop\website_my_year\scripts\gap-$label.png")
  $bmp.Dispose()
  Write-Output "$label gaps=$gaps"
}

function P($x, $y) { New-Object System.Drawing.PointF ([single]$x), ([single]$y) }

$male = @(
  @((P 68 45),(P 64 56),(P 63 70),(P 65 82)),
  @((P 65 82),(P 67 93),(P 78 101),(P 100 104)),
  @((P 100 104),(P 122 101),(P 135 93),(P 135 82)),
  @((P 135 82),(P 137 70),(P 136 56),(P 132 45)),
  @((P 132 45),(P 120 39),(P 80 39),(P 68 45))
)
GapCount "male" "C:\Users\ruska\Desktop\website_my_year\public\hero-hair-male.png" 56 6 87 78 $male

$female = @(
  @((P 76 47),(P 70 54),(P 66 66),(P 65 80)),
  @((P 65 80),(P 64 90),(P 74 99),(P 88 102)),
  @((P 88 102),(P 100 106),(P 114 102),(P 114 102)),
  @((P 114 102),(P 130 99),(P 140 90),(P 141 78)),
  @((P 141 78),(P 142 66),(P 134 54),(P 120 47)),
  @((P 120 47),(P 108 42),(P 88 42),(P 76 47))
)
GapCount "female" "C:\Users\ruska\Desktop\website_my_year\public\hero-hair-female.png" 44.5 13 120 120 $female
