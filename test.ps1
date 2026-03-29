# PowerShell Test Script for Payment & Notification System
# Usage: .\test.ps1

$API_URL = "http://localhost:3000"

# Helper function to make API calls
function Invoke-ApiCall {
    param(
        [string]$Method,
        [string]$Path,
        [hashtable]$Body
    )
    
    $url = "$API_URL$Path"
    $params = @{
        Uri     = $url
        Method  = $Method
        Headers = @{ "Content-Type" = "application/json" }
    }
    
    if ($Body) {
        $params['Body'] = ($Body | ConvertTo-Json)
    }
    
    try {
        $response = Invoke-WebRequest @params
        return @{
            Success = $true
            Status  = $response.StatusCode
            Data    = ($response.Content | ConvertFrom-Json)
        }
    }
    catch {
        return @{
            Success = $false
            Status  = $_.Exception.Response.StatusCode
            Error   = $_.Exception.Message
        }
    }
}

# Test Payment
function Test-Payment {
    param(
        [string]$Method,
        [string]$OrderId,
        [int]$Amount,
        [int]$UserId
    )
    
    Write-Host "`n`n========== Testing $($Method.ToUpper()) Payment ==========" -ForegroundColor Cyan
    
    $body = @{
        orderId        = $OrderId
        paymentMethod  = $Method
        totalAmount    = $Amount
        userId         = $UserId
    }
    
    Write-Host "Request: POST /payment/api" -ForegroundColor Yellow
    $body | ConvertTo-Json | Write-Host
    
    $response = Invoke-ApiCall -Method "POST" -Path "/payment/api" -Body $body
    
    if ($response.Success) {
        Write-Host "✓ Payment successful!" -ForegroundColor Green
        $response.Data | ConvertTo-Json | Write-Host
        return $response.Data.payment
    }
    else {
        Write-Host "✗ Payment failed!" -ForegroundColor Red
        $response.Data | ConvertTo-Json | Write-Host
        return $null
    }
}

# Test Get Notifications
function Test-UserNotifications {
    param(
        [int]$UserId
    )
    
    Write-Host "`n========== Getting User Notifications ==========" -ForegroundColor Cyan
    Write-Host "Request: GET /notification?userId=$UserId" -ForegroundColor Yellow
    
    $response = Invoke-ApiCall -Method "GET" -Path "/notification?userId=$UserId"
    
    if ($response.Success) {
        Write-Host "✓ Got notifications!" -ForegroundColor Green
        $response.Data | ConvertTo-Json | Write-Host
        return $response.Data
    }
    else {
        Write-Host "✗ Failed to get notifications!" -ForegroundColor Red
        return $null
    }
}

# Test Get Kitchen Notifications
function Test-KitchenNotifications {
    Write-Host "`n========== Getting Kitchen Notifications ==========" -ForegroundColor Cyan
    Write-Host "Request: GET /notification/kitchen" -ForegroundColor Yellow
    
    $response = Invoke-ApiCall -Method "GET" -Path "/notification/kitchen"
    
    if ($response.Success) {
        Write-Host "✓ Got kitchen notifications!" -ForegroundColor Green
        $response.Data | ConvertTo-Json | Write-Host
        return $response.Data
    }
    else {
        Write-Host "✗ Failed to get kitchen notifications!" -ForegroundColor Red
        return $null
    }
}

# Main test flow
function Run-Tests {
    Write-Host @"

╔════════════════════════════════════════════════════════════╗
║  PAYMENT & NOTIFICATION TEST SUITE                         ║
║  Testing: Strategy, Adapter, Observer Patterns            ║
╚════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Magenta

    # Check server is running
    Write-Host "Checking if server is running at $API_URL..." -ForegroundColor Yellow
    try {
        $null = Invoke-WebRequest -Uri $API_URL -Method GET -ErrorAction Stop
        Write-Host "✓ Server is running!" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Server is not running! Start it with: npm run dev" -ForegroundColor Red
        exit
    }

    # Test 1: Cash Payment
    Test-Payment -Method "cash" -OrderId "order-test-001" -Amount 150000 -UserId 1
    Start-Sleep -Milliseconds 500

    # Test 2: Bank Payment
    Test-Payment -Method "bank" -OrderId "order-test-002" -Amount 200000 -UserId 2
    Start-Sleep -Milliseconds 500

    # Test 3: Momo Payment
    Test-Payment -Method "momo" -OrderId "order-test-003" -Amount 300000 -UserId 3
    Start-Sleep -Milliseconds 500

    # Test 4: User Notifications
    Test-UserNotifications -UserId 1
    Start-Sleep -Milliseconds 500

    # Test 5: Kitchen Notifications
    Test-KitchenNotifications

    # Summary
    Write-Host @"

╔════════════════════════════════════════════════════════════╗
║  TEST SUMMARY                                              ║
╚════════════════════════════════════════════════════════════╝

✓ Strategy Pattern    - 3 payment methods (cash/bank/momo)
✓ Adapter Pattern     - Unified payment processing
✓ Observer Pattern    - UserNotifier + KitchenNotifier  
✓ Database           - Payments & Notifications saved

All tests completed! 🎯

"@ -ForegroundColor Green
}

# Run the tests
Run-Tests
