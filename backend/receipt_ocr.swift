import Foundation
import Vision

guard CommandLine.arguments.count == 2 else {
    fputs("Usage: swift receipt_ocr.swift IMAGE_PATH\n", stderr)
    exit(2)
}

let imageURL = URL(fileURLWithPath: CommandLine.arguments[1])
let request = VNRecognizeTextRequest()
request.recognitionLevel = .accurate
request.recognitionLanguages = ["ko-KR", "en-US"]
request.usesLanguageCorrection = true

do {
    let handler = VNImageRequestHandler(url: imageURL, options: [:])
    try handler.perform([request])
    let lines: [[String: Any]] = (request.results ?? [])
        .compactMap { observation in
            guard let candidate = observation.topCandidates(1).first else { return nil }
            return [
                "text": candidate.string,
                "confidence": Double(candidate.confidence),
                "x": Double(observation.boundingBox.midX),
                "y": Double(observation.boundingBox.midY),
            ]
        }
        .sorted { first, second in
            let rowDifference = (first["y"] as! Double) - (second["y"] as! Double)
            if abs(rowDifference) > 0.025 { return rowDifference > 0 }
            return (first["x"] as! Double) < (second["x"] as! Double)
        }
    let data = try JSONSerialization.data(withJSONObject: lines)
    FileHandle.standardOutput.write(data)
} catch {
    fputs("Vision recognition failed: \(error.localizedDescription)\n", stderr)
    exit(1)
}
