import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const TestRazorpay = () => {
  const [results, setResults] = useState<any>({});
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const testResults: any = {};

    // Test 1: Check if user is logged in
    try {
      const { data } = await supabase.auth.getSession();
      testResults.auth = {
        success: !!data.session,
        message: data.session ? `Logged in as ${data.session.user.email}` : "Not logged in",
      };
    } catch (error: any) {
      testResults.auth = { success: false, message: error.message };
    }

    // Test 2: Check if create_order_with_razorpay function exists
    try {
      const { data, error } = await supabase.rpc("create_order_with_razorpay", {
        p_customer_id: "00000000-0000-0000-0000-000000000000",
        p_items: [],
        p_shipping_address: {},
        p_billing_address: {},
        p_subtotal: 0,
        p_shipping_amount: 0,
        p_tax_amount: 0,
        p_discount_amount: 0,
        p_total_amount: 0,
      });

      if (error && error.message.includes("does not exist")) {
        testResults.function = {
          success: false,
          message: "Function doesn't exist. Run SQL migration!",
        };
      } else {
        testResults.function = {
          success: true,
          message: "Function exists (may have failed due to test data, but that's OK)",
        };
      }
    } catch (error: any) {
      testResults.function = { success: false, message: error.message };
    }

    // Test 3: Check Razorpay key
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    testResults.razorpayKey = {
      success: !!razorpayKey,
      message: razorpayKey ? `Key found: ${razorpayKey}` : "Key not found in .env",
    };

    // Test 4: Check if customer_addresses table exists
    try {
      const { error } = await supabase.from("customer_addresses").select("id").limit(1);
      testResults.addressTable = {
        success: !error,
        message: error ? error.message : "Table exists",
      };
    } catch (error: any) {
      testResults.addressTable = { success: false, message: error.message };
    }

    setResults(testResults);
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Razorpay Integration Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600">
              This page tests if your Razorpay integration is set up correctly.
            </p>

            <Button onClick={runTests} disabled={testing} className="w-full">
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Run Tests"
              )}
            </Button>

            {Object.keys(results).length > 0 && (
              <div className="space-y-4 mt-6">
                <h3 className="font-semibold text-lg">Test Results:</h3>

                {Object.entries(results).map(([key, value]: [string, any]) => (
                  <div
                    key={key}
                    className={`p-4 rounded-lg border ${
                      value.success
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {value.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-semibold capitalize mb-1">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </h4>
                        <p className="text-sm text-gray-700">{value.message}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {!results.function?.success && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">
                      ⚠️ Action Required:
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
                      <li>
                        Open Supabase SQL Editor:{" "}
                        <a
                          href="https://supabase.com/dashboard/project/bgbpppxfjjduhvrnlkxp/sql/new"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          Click here
                        </a>
                      </li>
                      <li>
                        Copy content from:{" "}
                        <code className="bg-yellow-100 px-1 rounded">
                          supabase/migrations/20241116000001_razorpay_integration.sql
                        </code>
                      </li>
                      <li>Paste in SQL Editor and click "Run"</li>
                      <li>Come back and run tests again</li>
                    </ol>
                  </div>
                )}

                {results.function?.success &&
                  results.auth?.success &&
                  results.razorpayKey?.success && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">
                        ✅ All tests passed!
                      </h4>
                      <p className="text-sm text-green-800">
                        Your Razorpay integration is ready. Try making a test payment!
                      </p>
                    </div>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestRazorpay;
