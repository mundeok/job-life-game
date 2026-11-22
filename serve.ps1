# Tiny static file server for this folder (no Node/Python needed).
#   powershell -ExecutionPolicy Bypass -File serve.ps1   ->  http://localhost:8742/
# The game also runs by double-clicking index.html; this is only for previewing over http.
param([int]$Port = 8742)
$root = $PSScriptRoot
$types = @{ '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'; '.css' = 'text/css; charset=utf-8'; '.json' = 'application/json; charset=utf-8'; '.svg' = 'image/svg+xml'; '.png' = 'image/png' }
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port/"
try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    try {
      $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
      if ($rel -eq '') { $rel = 'index.html' }
      $path = [System.IO.Path]::GetFullPath((Join-Path $root $rel))
      if ($path.StartsWith($root) -and (Test-Path -LiteralPath $path -PathType Leaf)) {
        $bytes = [System.IO.File]::ReadAllBytes($path)
        $ext = [System.IO.Path]::GetExtension($path).ToLower()
        if ($types.ContainsKey($ext)) { $ctx.Response.ContentType = $types[$ext] }
        $ctx.Response.Headers.Add('Cache-Control', 'no-store')
        if ($ctx.Request.HttpMethod -ne 'HEAD') { $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length) }
      } else {
        $ctx.Response.StatusCode = 404
      }
      $ctx.Response.Close()
    } catch {
      try { $ctx.Response.Abort() } catch {}
    }
  }
} finally { $listener.Stop() }
