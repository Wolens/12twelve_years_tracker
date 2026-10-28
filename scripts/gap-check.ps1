Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile("C:\Users\ruska\Desktop\website_my_year\public\hero-2d-male.png")
$c = $b.GetPixel(431, 720)
"gap a=$($c.A) rgb=$($c.R),$($c.G),$($c.B)" | Set-Content "C:\Users\ruska\Desktop\website_my_year\scripts\gap-check.txt"
$b.Dispose()
