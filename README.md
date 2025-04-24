# Fuzzy Matcher Web App

A browser-based tool for fuzzy matching between datasets. This application helps you find and score potential matches between two datasets based on configurable similarity thresholds.

Visit [https://codehopperreddit.github.io/fuzzymatcher/](https://codehopperreddit.github.io/fuzzymatcher/) to use the application immediately.

## 🌟 Features

- **Browser-Only Processing**: All data processing happens client-side - no server required
- **Multiple File Formats**: Import data from CSV and Excel files
- **Customizable Matching**:
  - Configure field weights for matching priority
  - Set thresholds for good, moderate, and poor matches
  - Preprocess data for better matching (lowercase, remove special characters, etc.)
- **Powerful Results**:
  - Color-coded match results based on quality
  - Export results to CSV for further analysis
  - Statistics and visualizations for match quality distribution
- **Responsive Design**: Works on desktop and mobile devices

## 📋 Use Cases

- **Data Cleansing**: Find duplicate records across datasets
- **Entity Resolution**: Link records from different sources that refer to the same entity
- **Customer Matching**: Match customers across different systems or databases
- **Address Verification**: Compare addresses to standardized data
- **Record Linkage**: Connect datasets without common unique identifiers


## 📖 How to Use

### 1. Prepare Your Data

For best results:
- Ensure both datasets have the same field structure
- Clean data beforehand if possible (standardize formats, fix obvious errors)
- Include unique identifiers in each dataset

### 2. Load Your Data

1. Go to the "Items To Match" tab and upload your primary dataset
2. Go to the "Source To Match Against" tab and upload your comparison dataset

### 3. Configure Field Weights

In the "Items To Match" tab:
- Set weights for each field (defaults to 1)
- Use higher weights (e.g., 2, 3) for more reliable fields
- Use "0" to exclude a field from match calculation
- Use "M" to designate a "must-match" field

### 4. Adjust Matching Parameters

In the "Control Settings" tab:
- **Number of matches to find**: Maximum matches to return per record
- **Minimum Acceptable Match Quality**: Threshold below which matches are ignored
- **Good Quality Match**: Threshold for a good match
- **Preprocessing Options**: Select data cleanup options to apply

### 5. Run the Matching Process

Click "Run Matching" to start the process. The progress bar will show status.

### 6. Review Results

- **Results Tab**: View all matches with color coding by quality
- **Analysis Tab**: See statistics and visualizations
- Click "Export to CSV" to save results for further analysis

## 🔧 Technical Details

The application uses the following technologies:
- **Bootstrap 5**: For responsive UI elements
- **PapaParse**: For CSV parsing
- **SheetJS**: For Excel file processing
- **Chart.js**: For data visualization
- **Browser-native string similarity algorithms**: For fuzzy matching

All processing happens in the browser, with no data sent to any server.

## ⚠️ Limitations

- **Performance**: Large datasets (>10,000 records) may cause performance issues
- **Memory Usage**: Browser memory limits apply
- **Algorithm**: The simplified string matching algorithm is less sophisticated than specialized libraries
- **Browser Support**: Modern browsers required (Chrome, Firefox, Edge, Safari)

## 🔮 Future Improvements

- Advanced matching algorithms
- Phonetic matching for names
- Export to Excel
- Save/restore settings
- Manual match review workflow
- Batch processing for large datasets

