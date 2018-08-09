param(
    [string]
    [Parameter(Mandatory = $true)]
    $SongPackDir,

    [string]
    [Parameter(Mandatory = $false)]
    $OutDir = "../out"
)

# Create out dir if it doesn't already exist
$OutDir = mkdir -force "$OutDir"

# Get songpack name from dir path
$SongPackName = gi $SongPackDir | %{ $_.BaseName }

# Calculate SongPack OutDir
$SongPackOutDir = "$OutDir/$SongPackName/songs"

# Create output songpack dir if it doesn't already exist
mkdir -force $SongPackOutDir | Out-Null

Push-Location

try {
    cd (Convert-Path "$PSScriptRoot/../")

    gci -Path $SongPackDir -Recurse -Depth 3 -Filter "*.sm" `
        | % {
            $ChartName = $_.BaseName;
            $ChartPath = '"' + [System.Management.Automation.WildcardPattern]::Escape($_.FullName) + '"';
            $SanitizedChartName = ([regex]"[^A-Za-z0-9_.]+").Replace($ChartName, '_');
            $ChartOutPath = "$SongPackOutDir/$SanitizedChartName.json"

            Write-Host -ForegroundColor Green "Parsing '$ChartName'"
            Write-Host -ForegroundColor White "  Path: $ChartPath"
            Write-Host -ForegroundColor White "  Writing to '$ChartOutPath'"
            
            Invoke-Expression "&'npm' $(@('run', '--silent', 'start', '--', '-f', $ChartPath, '-b' )) > '$ChartOutPath'" 
        }
}
finally {
    Pop-Location
}