"use client";
import { H2, P } from "@/components/atoms";
import { Button } from "@/components/molecules";

function AppDownloadSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-teal-500 to-blue-600">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-center md:items-start text-white ">
            <H2
              stringProps={{ plainText: "Book on the go" }}
              className="text-3xl font-bold mb-4"
            />
            <P
              stringProps={{
                plainText:
                  "Download our app for easy booking anytime, anywhere",
              }}
              className="text-xl mb-8 opacity-90"
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                buttonText={{ plainText: "App Store" }}
                variant="containedRevers"
                prefixIcon={{ icon: "lucide:apple" }}
                onClick={() => console.log("Download Button clicked")}
              />
              <Button
                buttonText={{ plainText: "Google Play" }}
                variant="containedRevers"
                prefixIcon={{ icon: "lucide:play" }}
                onClick={() => console.log("Download Button clicked")}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8">
              <div className="bg-white rounded-xl p-6 text-center">
                <div className="text-2xl font-bold text-teal-500 mb-2">
                  Bookly
                </div>
                <div className="text-sm text-gray-600">Mobile App</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AppDownloadSection;
