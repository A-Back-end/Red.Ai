#!/bin/bash
# GTM Testing Script for Red.AI
# Tests Google Tag Manager connectivity and functionality

echo "🔬 GTM Testing Script for Red.AI"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    case $2 in
        "success") echo -e "${GREEN}✅ $1${NC}" ;;
        "error") echo -e "${RED}❌ $1${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $1${NC}" ;;
        "info") echo -e "${BLUE}ℹ️  $1${NC}" ;;
        *) echo "📝 $1" ;;
    esac
}

# Check if server is running
check_server() {
    print_status "Checking if server is running..." "info"
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|302\|404"; then
        print_status "Server is running on localhost:3000" "success"
        SERVER_RUNNING=true
    else
        print_status "Server is not running on localhost:3000" "warning"
        SERVER_RUNNING=false
    fi
}

# Test GTM script loading
test_gtm_script() {
    print_status "Testing GTM script accessibility..." "info"
    
    GTM_SCRIPT_URL="https://www.googletagmanager.com/gtm.js?id=GTM-KMRVH2GD"
    
    if curl -s --head "$GTM_SCRIPT_URL" | head -n 1 | grep -q "200 OK"; then
        print_status "GTM script is accessible" "success"
    else
        print_status "GTM script is not accessible" "error"
    fi
}

# Test measurement endpoint
test_measurement_endpoint() {
    print_status "Testing GTM measurement endpoint..." "info"
    
    MEASUREMENT_URL="https://www.google-analytics.com/mp/collect"
    
    if curl -s --head "$MEASUREMENT_URL" | head -n 1 | grep -q "200\|405"; then
        print_status "GTM measurement endpoint is accessible" "success"
    else
        print_status "GTM measurement endpoint is not accessible" "error"
    fi
}

# Open test pages
open_test_pages() {
    print_status "Opening test pages..." "info"
    
    if [ "$SERVER_RUNNING" = true ]; then
        echo ""
        echo "📄 Available test pages:"
        echo "  - Original GA4 test: http://localhost:3000/test-ga4.html"
        echo "  - GA4 Comprehensive: http://localhost:3000/test-ga4-comprehensive.html"
        echo "  - GTM Comprehensive: http://localhost:3000/test-gtm-comprehensive.html ⭐"
        echo ""
        
        # Check if we're on macOS or Linux
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            open "http://localhost:3000/test-gtm-comprehensive.html"
            print_status "Opened GTM comprehensive test page in browser" "success"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            xdg-open "http://localhost:3000/test-gtm-comprehensive.html" 2>/dev/null
            print_status "Attempted to open GTM comprehensive test page in browser" "info"
        else
            print_status "Please manually open: http://localhost:3000/test-gtm-comprehensive.html" "info"
        fi
    else
        print_status "Server not running. Start server first with: npm run dev" "warning"
    fi
}

# Check network connectivity
check_network() {
    print_status "Checking network connectivity..." "info"
    
    # Test Google connectivity
    if ping -c 1 google.com > /dev/null 2>&1; then
        print_status "Network connectivity to Google: OK" "success"
    else
        print_status "Network connectivity to Google: FAILED" "error"
    fi
    
    # Test specific GA domains
    for domain in "www.googletagmanager.com" "www.google-analytics.com"; do
        if ping -c 1 "$domain" > /dev/null 2>&1; then
            print_status "Connectivity to $domain: OK" "success"
        else
            print_status "Connectivity to $domain: FAILED" "error"
        fi
    done
}

# Show debugging commands
show_debug_commands() {
    echo ""
    print_status "Manual Testing Commands:" "info"
    echo ""
    echo "🔍 Check browser console:"
    echo "   Open DevTools > Console and look for:"
    echo "   '📊 GTM Event sent: page_view'"
    echo ""
    echo "🌐 Monitor network requests:"
    echo "   Open DevTools > Network tab"
    echo "   Filter by 'googletagmanager' or 'google-analytics'"
    echo "   Look for requests to GTM and collect endpoints"
    echo ""
    echo "📊 Check real-time analytics:"
    echo "   Visit: https://analytics.google.com/analytics/web/"
    echo "   Go to Real-time > Overview"
    echo "   Should see active users when testing"
    echo ""
    echo "🧪 Test with curl:"
    echo "   curl -I https://www.google-analytics.com/mp/collect"
    echo "   curl -I https://www.googletagmanager.com/gtm.js?id=GTM-KMRVH2GD"
    echo ""
}

# Generate test report
generate_report() {
    echo ""
    print_status "GTM Test Report Generated" "info"
    echo "=========================="
    echo "Timestamp: $(date)"
    echo "Server Status: $([ "$SERVER_RUNNING" = true ] && echo "Running" || echo "Not Running")"
    echo "GTM Container: GTM-KMRVH2GD"
    echo "Test Pages: Available in project root"
    echo "Next Steps: Open test page and check GTM in Tag Assistant"
    echo ""
}

# Main execution
main() {
    echo ""
    
    # Run all tests
    check_server
    check_network
    test_gtm_script
    test_measurement_endpoint
    
    echo ""
    print_status "Opening test environment..." "info"
    open_test_pages
    
    # Show manual debugging steps
    show_debug_commands
    
    # Generate final report
    generate_report
    
    echo "🎯 Next steps:"
    echo "1. Open the GTM test page that just opened"
    echo "2. Click the test buttons and check console for GTM events"
    echo "3. Use Google Tag Assistant to verify GTM is working"
    echo "4. Check GA4 Real-time reports (if GTM is connected to GA4)"
    echo "5. Monitor Network tab for GTM requests"
    echo ""
}

# Run main function
main "$@" 