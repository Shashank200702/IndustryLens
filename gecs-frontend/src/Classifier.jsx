import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Classifier.css";

const API = "https://shashankmugali-industrylens-api.hf.space";

const INDUSTRY_NAMES = {
  "10110010": "Agricultural Inputs",
  "10120010": "Building Materials",
  "10130010": "Chemicals",
  "10130020": "Specialty Chemicals",
  "10140010": "Lumber & Wood Production",
  "10140020": "Paper & Paper Products",
  "10150010": "Aluminum",
  "10150020": "Copper",
  "10150030": "Other Industrial Metals & Mining",
  "10150040": "Gold",
  "10150050": "Silver",
  "10150060": "Other Precious Metals & Mining",
  "10160010": "Coking Coal",
  "10160020": "Steel",
  "10200010": "Auto & Truck Dealerships",
  "10200020": "Auto Manufacturers",
  "10200030": "Auto Parts",
  "10200040": "Recreational Vehicles",
  "10220010": "Furnishings, Fixtures & Appliances",
  "10230010": "Residential Construction",
  "10240010": "Textile Manufacturing",
  "10240020": "Apparel Manufacturing",
  "10240030": "Footwear & Accessories",
  "10250010": "Packaging & Containers",
  "10260010": "Personal Services",
  "10270010": "Restaurants",
  "10280010": "Apparel Retail",
  "10280020": "Department Stores",
  "10280030": "Home Improvement Retail",
  "10280040": "Luxury Goods",
  "10280050": "Internet Retail",
  "10280060": "Specialty Retail",
  "10290010": "Gambling",
  "10290020": "Leisure",
  "10290030": "Lodging",
  "10290040": "Resorts & Casinos",
  "10290050": "Travel Services",
  "10310010": "Asset Management",
  "10320010": "Banks - Diversified",
  "10320020": "Banks - Regional",
  "10320030": "Mortgage Finance",
  "10330010": "Capital Markets",
  "10330020": "Financial Data & Stock Exchanges",
  "10340010": "Insurance - Life",
  "10340020": "Insurance - Property & Casualty",
  "10340030": "Insurance - Reinsurance",
  "10340040": "Insurance - Specialty",
  "10340050": "Insurance Brokers",
  "10340060": "Insurance - Diversified",
  "10350010": "Shell Companies",
  "10350020": "Financial Conglomerates",
  "10360010": "Credit Services",
  "10410010": "Real Estate - Development",
  "10410020": "Real Estate Services",
  "10410030": "Real Estate - Diversified",
  "10420010": "REIT - Healthcare Facilities",
  "10420020": "REIT - Hotel & Motel",
  "10420030": "REIT - Industrial",
  "10420040": "REIT - Office",
  "10420050": "REIT - Residential",
  "10420060": "REIT - Retail",
  "10420070": "REIT - Mortgage",
  "10420080": "REIT - Specialty",
  "10420090": "REIT - Diversified",
  "20510010": "Beverages - Brewers",
  "20510020": "Beverages - Wineries & Distilleries",
  "20520010": "Beverages - Non-Alcoholic",
  "20525010": "Confectioners",
  "20525020": "Farm Products",
  "20525030": "Household & Personal Products",
  "20525040": "Packaged Foods",
  "20540010": "Education & Training Services",
  "20550010": "Discount Stores",
  "20550020": "Food Distribution",
  "20550030": "Grocery Stores",
  "20560010": "Tobacco",
  "20610010": "Biotechnology",
  "20620010": "Drug Manufacturers - General",
  "20620020": "Drug Manufacturers - Specialty & Generic",
  "20630010": "Healthcare Plans",
  "20645010": "Medical Care Facilities",
  "20645020": "Pharmaceutical Retailers",
  "20645030": "Health Information Services",
  "20650010": "Medical Devices",
  "20650020": "Medical Instruments & Supplies",
  "20660010": "Diagnostics & Research",
  "20670010": "Medical Distribution",
  "20710010": "Utilities - Independent Power Producers",
  "20710020": "Utilities - Renewable",
  "20720010": "Utilities - Regulated Water",
  "20720020": "Utilities - Regulated Electric",
  "20720030": "Utilities - Regulated Gas",
  "20720040": "Utilities - Diversified",
  "30810010": "Telecom Services",
  "30820010": "Advertising Agencies",
  "30820020": "Publishing",
  "30820030": "Broadcasting",
  "30820040": "Entertainment",
  "30830010": "Internet Content & Information",
  "30830020": "Electronic Gaming & Multimedia",
  "30910010": "Oil & Gas Drilling",
  "30910020": "Oil & Gas E&P",
  "30910030": "Oil & Gas Integrated",
  "30910040": "Oil & Gas Midstream",
  "30910050": "Oil & Gas Refining & Marketing",
  "30910060": "Oil & Gas Equipment & Services",
  "30920010": "Thermal Coal",
  "30920020": "Uranium",
  "31010010": "Aerospace & Defense",
  "31020010": "Specialty Business Services",
  "31020020": "Consulting Services",
  "31020030": "Rental & Leasing Services",
  "31020040": "Security & Protection Services",
  "31020050": "Staffing & Employment Services",
  "31030010": "Conglomerates",
  "31040010": "Engineering & Construction",
  "31040020": "Infrastructure Operations",
  "31040030": "Building Products & Equipment",
  "31050010": "Farm & Heavy Construction Machinery",
  "31060010": "Industrial Distribution",
  "31070010": "Business Equipment & Supplies",
  "31070020": "Specialty Industrial Machinery",
  "31070030": "Metal Fabrication",
  "31070040": "Pollution & Treatment Controls",
  "31070050": "Tools & Accessories",
  "31070060": "Electrical Equipment & Parts",
  "31080010": "Airports & Air Services",
  "31080020": "Airlines",
  "31080030": "Railroads",
  "31080040": "Marine Shipping",
  "31080050": "Trucking",
  "31080060": "Integrated Freight & Logistics",
  "31090010": "Waste Management",
  "31110010": "Information Technology Services",
  "31110020": "Software - Application",
  "31110030": "Software - Infrastructure",
  "31120010": "Communication Equipment",
  "31120020": "Computer Hardware",
  "31120030": "Consumer Electronics",
  "31120040": "Electronic Components",
  "31120050": "Electronics & Computer Distribution",
  "31120060": "Scientific & Technical Instruments",
  "31130010": "Semiconductor Equipment & Materials",
  "31130020": "Semiconductors",
  "31130030": "Solar",
};

const ACTIVITY_NAMES = {
  "1011001001": "Pesticide and Agrichemical Manufacturer",
  "1011001002": "Anhydrous Ammonia Manufacturer",
  "1011001003": "Agricultural Input Distributor",
  "1011001004": "Fertilizer Manufacturer",
  "1011001005": "Nitric Acid Manufacturer",
  "1012001001": "Lime and Plaster Manufacturer",
  "1012001002": "Concrete Products for Construction Manufacturer",
  "1012001003": "Ready mix Concrete Manufacturer",
  "1012001004": "Building Materials Distributor",
  "1012001005": "Glass Manufacturer",
  "1012001006": "Cement Manufacturer",
  "1012001099": "Other Building Materials Manufacturer",
  "1013001001": "Basic Chemicals Distributor",
  "1013001002": "Organic Basic Chemicals Manufacturer",
  "1013001003": "Soda Ash Manufacturer",
  "1013001004": "Chlorine Manufacturer",
  "1013001099": "Other Chemical Products Manufacturer",
  "1013002001": "Specialty Chemicals Distributor",
  "1013002002": "Explosives Manufacturer",
  "1013002003": "Glue and Adhesives Manufacturer",
  "1013002004": "Coatings Manufacturer",
  "1013002005": "Enzymes, Nutritional Ingredients, and Catalyzers Manufacturer",
  "1013002006": "Industrial Gases Manufacturer",
  "1013002007": "Primary Rubber Manufacturer",
  "1013002008": "Hydrogen Manufacturer",
  "1013002009": "Carbon Black Manufacturer",
  "1013002010": "Primary Plastic Manufacturer",
  "1013002011": "Biogas and Biofuel Manufacturer",
  "1014001001": "Lumber Production",
  "1014001002": "Wood Product Manufacturer",
  "1014001003": "Lumber Distributor",
  "1014001004": "Veneer Sheets Manufacturer",
  "1014001005": "Afforestation",
  "1014001006": "Forestry Rehabilitation and Restoration",
  "1014001007": "Existing Forest Management",
  "1014001008": "Forest Conservation",
  "1014001009": "Wetlands Restoration",
  "1014002001": "Paper Manufacturer",
  "1014002002": "Pulp Manufacturer",
  "1014002003": "Pulp or Paper Distributor",
  "1015001001": "Aluminum Manufacturer",
  "1015001002": "Aluminum Distributor",
  "1015002001": "Copper Mining",
  "1015002002": "Copper Distributor",
  "1015002003": "Royalties from Copper Mines",
  "1015003001": "Industrial Metal Mining",
  "1015003002": "Royalties from Industrial Metal Mines",
  "1015003003": "Industrial Metal Distributor",
  "1015003099": "Other Mining and Quarrying Support Activities",
  "1015004001": "Gold Mining",
  "1015004002": "Royalties from Gold Mines",
  "1015005001": "Silver Mining",
  "1015005002": "Royalties from Silver Mines",
  "1015006001": "Precious Metal Production",
  "1015006002": "Royalties from Precious Metal Mines",
  "1016001001": "Coking Coal Mining",
  "1016002001": "Iron Mining",
  "1016002002": "Royalties from Iron Mines",
  "1016002003": "Iron and Steel Manufacturer",
  "1016002004": "Iron and Steel Distributor",
  "1020001001": "Automotive Dealer",
  "1020001002": "Automotive Service Center",
  "1020002001": "Automotive Engine Manufacturer",
  "1020002002": "Motorcycle Manufacturer",
  "1020002003": "Passenger Car and Commercial Vehicle Manufacturer",
  "1020002004": "Low Carbon Technology Light Duty Vehicle Manufacturer",
  "1020003001": "Tire Manufacturer",
  "1020003002": "Automotive Parts and Accessories Retailer",
  "1020003003": "Automotive Parts Manufacturer",
  "1020003004": "Automotive Batteries Manufacturer",
  "1020004001": "Snowmobile Manufacturer",
  "1020004002": "Marine Vehicle Manufacturer",
  "1020004003": "Electric Recreational Vehicle Manufacturer",
  "1020004099": "Other Recreational Vehicle Manufacturer",
  "1022001001": "Electric Household Appliances Manufacturer",
  "1022001002": "Non Electric Household Appliances Manufacturer",
  "1022001003": "Kitchen Furniture Manufacturer",
  "1022001004": "Mattress Manufacturer",
  "1022001005": "Furniture, Fixtures and Appliances Distributor",
  "1022001006": "Furniture Manufacturer",
  "1022001007": "Lighting fixtures Manufacturer",
  "1023001001": "Construction of Residential Buildings",
  "1023001002": "Renovation of Residential Buildings",
  "1024001001": "Textiles Finishings Services",
  "1024001002": "Textiles Distributor",
  "1024001003": "Natural Fiber Textiles Manufacturer",
  "1024001099": "Other Textiles Manufacturer",
  "1024002001": "Garment Manufacturer",
  "1024002002": "Apparel Components Manufacturer",
  "1024002003": "Apparel Distributor",
  "1024003001": "Footwear Manufacturer",
  "1024003002": "Footwear and Accessories Distributor",
  "1024003003": "Accessories Manufacturer",
  "1025001001": "Metal Container Manufacturer",
  "1025001002": "Glass Container Manufacturer",
  "1025001003": "Wooden Container Manufacturer",
  "1025001004": "Plastic Packaging Manufacturer",
  "1025001005": "Paper Packaging Manufacturer",
  "1025001099": "Other Containers and Packaging Manufacturer",
  "1026001001": "Personal Legal Services",
  "1026001002": "Personalized Services",
  "1027001001": "Restaurants",
  "1028001001": "Apparel Retail",
  "1028002001": "Department Stores",
  "1028003001": "Hardware and Building Material Retailer",
  "1028003002": "Floor and Wall Coverings Retailer",
  "1028003099": "Other Home Improvement Products Retailer",
  "1028004001": "Luxury Goods",
  "1028005001": "Internet Food Delivery Platform",
  "1028005002": "Internet Retail Platform",
  "1028006001": "Gas Station",
  "1028006002": "Charging Station",
  "1028006003": "Books, Newspaper and Stationery Retailer",
  "1028006004": "Sporting Goods Retailer",
  "1028006005": "Cosmetic and Toiletries Retailer",
  "1028006006": "Catalog Retailer",
  "1028006007": "Games and Toys Retailer",
  "1028006008": "Electronic Good Retailer",
  "1028006009": "Furniture Retailer",
  "1028006099": "Other Specialized Retailer",
  "1029001001": "Gambling Activities",
  "1029001002": "Gambling Products",
  "1029002001": "Recreational Products Manufacturer",
  "1029002002": "Fitness Club and Facilities Operator",
  "1029002003": "Cruise Line",
  "1029002099": "Other Leisure Facilities",
  "1029003001": "Lodging",
  "1029004001": "Resorts",
  "1029004002": "Casinos",
  "1029005001": "Travel Agency",
  "1029005002": "Tour Operator",
  "1031001001": "Diversified Fund",
  "1031001002": "Investment Management",
  "1031001003": "Wealth Management",
  "1031001004": "Private Equity",
  "1031001005": "Custodian Operations",
  "1031001099": "Other Asset Management Services",
  "1032001001": "International Retail Banking",
  "1032001002": "International Wholesale Banking",
  "1032001003": "Community Development Bank",
  "1032001004": "International Financial Institution",
  "1032001005": "National Development Bank",
  "1032001006": "Multilateral Development Bank",
  "1032001007": "Export Credit Agency",
  "1032001099": "Other International Banking Activities",
  "1032002001": "Regional Retail Banking",
  "1032002002": "Regional Wholesale Banking",
  "1032002099": "Other Regional Banking Activities",
  "1032003001": "Mortgage Finance",
  "1032003002": "Building Societies",
  "1033001001": "Investment Banking",
  "1033001002": "Brokerage Services",
  "1033002001": "Financial Exchanges",
  "1033002002": "Credit Rating and Reporting",
  "1033002003": "Financial Data and Research",
  "1034001001": "Life Insurance Provider",
  "1034001002": "Health Insurance Provider",
  "1034002001": "Non-Life Insurance Provider",
  "1034002002": "Automotive Insurance Provider",
  "1034002003": "Commercial Business Insurance Provider",
  "1034002004": "Home Insurance Provider",
  "1034003001": "Insurance - Reinsurance",
  "1034004001": "Mortgage Insurance Provider",
  "1034004002": "Travel Insurance Provider",
  "1034004099": "Other Specialty Insurance Provider",
  "1034005001": "Insurance Brokers",
  "1034006001": "Insurance - Diversified",
  "1035001001": "Shell Companies",
  "1035002001": "Financial Conglomerates",
  "1035002002": "Holding Companies",
  "1036001001": "Credit Provider",
  "1036001002": "Collection Agencies",
  "1036001003": "Credit Evaluation",
  "1041001001": "Development of Residential Buildings",
  "1041001002": "Development of Non Residential Buildings",
  "1041002001": "Acquisition and Ownership of Buildings",
  "1041002002": "Property Management",
  "1041002003": "Real Estate Agent, Advisory and Solutions Provider",
  "1041003001": "Real Estate - Diversified",
  "1042001001": "REIT - Hospital",
  "1042001099": "REIT - Long Term Care and Other Facilities",
  "1042002001": "REIT - Hotel & Motel",
  "1042003001": "REIT - Industrial",
  "1042004001": "REIT - Office",
  "1042005001": "REIT - Apartment",
  "1042005002": "REIT - Single Family",
  "1042006001": "REIT - Mall",
  "1042006002": "REIT - Shopping Center",
  "1042007001": "REIT - Mortgage",
  "1042008001": "REIT - Advertising",
  "1042008002": "REIT - Telecom Tower",
  "1042008003": "REIT - Timberland",
  "1042008099": "Other Specialty REIT",
  "1042009001": "REIT - Diversified",
  "2051001001": "Beverages - Brewers",
  "2051002001": "Wine Producer",
  "2051002002": "Liquor Producer",
  "2052001001": "Carbonated Drink Producer",
  "2052001002": "Non-Carbonated Drinks Producer",
  "2052501001": "Raw Sugar Manufacturer",
  "2052501002": "Chocolate Manufacturer",
  "2052501099": "Other Confectionery Products Manufacturer",
  "2052502001": "Growing of Perennial Crops",
  "2052502002": "Growing of Non-Perennial Crops",
  "2052502003": "Livestock Producer",
  "2052502004": "Aquaculture",
  "2052503001": "Household Goods Manufacturer",
  "2052503002": "Personal Goods Manufacturer",
  "2052504001": "Packaged or Frozen Food Manufacturer",
  "2052504002": "Health Supplement Manufacturer",
  "2052504003": "Dairy Product Manufacturer",
  "2054001001": "Educational Services (Business to Consumer)",
  "2054001002": "Training Services (Business to Business)",
  "2055001001": "Discount Stores",
  "2055002001": "Food Distribution",
  "2055003001": "Grocery Stores",
  "2056001001": "Tobacco Products Manufacturer",
  "2056001002": "Wholesale or Retail of Tobacco and Tobacco Products",
  "2061001001": "Research and Development of Rare Diseases",
  "2061001002": "Diversified Biotechnology",
  "2061001003": "Ribonucleic Acid (RNA) Therapy",
  "2061001004": "Gene Editing Therapy",
  "2062001001": "Drug Manufacturers - General",
  "2062002001": "Drug Manufacturers - Specialty & Generic",
  "2063001001": "Healthcare Plans",
  "2064501001": "Hospital Inpatient Services",
  "2064501002": "Healthcare Facility Ancillary Services",
  "2064501003": "Long-Term Care Center",
  "2064501004": "Outpatient Services",
  "2064502001": "Pharmaceutical Retailer",
  "2064503001": "Decision and Risk Analysis",
  "2064503002": "Enterprise Systems",
  "2064503003": "Medical Records Systems",
  "2064503004": "Outcome Management",
  "2064503099": "Other Healthcare Technology Systems",
  "2065001001": "Diagnostic and Testing Equipment",
  "2065001002": "Medical Devices",
  "2065002001": "Dental Instrument Manufacturer",
  "2065002002": "Medical Tools and Equipment Manufacturer",
  "2065002003": "Ophthalmic Goods Manufacturer",
  "2066001001": "Testing and Diagnosis Center",
  "2066001002": "Medical Contract Research Services",
  "2067001001": "Medical Devices and Instruments Distributor",
  "2067001002": "Drug Distributor",
  "2067001099": "Other Healthcare Products Distributor",
  "2071001001": "Cogeneration of Heating, Cooling, and Power - Gas",
  "2071001002": "Heating and Cooling Producers - Gas",
  "2071001003": "Heating and Cooling Producers - Waste Heat",
  "2071001004": "District Heating and Cooling Distributors",
  "2071002001": "Electricity Generator - Solar Photovoltaic Technology",
  "2071002002": "Electricity Generator - Concentrated Solar Power (CSP) Technology",
  "2071002003": "Electricity Generator - Wind Power",
  "2071002004": "Electricity Generator - Ocean Energy Technologies",
  "2071002005": "Electricity Generator - Hydropower",
  "2071002006": "Electricity Generator - Geothermal Energy",
  "2071002007": "Electricity Generator - Bioenergy",
  "2071002008": "Electricity Generator - Renewable Non-Fossil Gaseous and Liquid Fuels",
  "2071002009": "Thermal Energy Storage",
  "2071002010": "Cogeneration of Heating, Cooling, and Power - Solar Energy",
  "2071002011": "Cogeneration of Heating, Cooling, and Power - Geothermal Energy",
  "2071002012": "Cogeneration of Heating, Cooling, and Power - Bioenergy",
  "2071002013": "Cogeneration of Heating, Cooling, and Power - Renewable Non-Fossil Gaseous and Liquid Fuels",
  "2071002014": "Heating and Cooling Producers - Solar Thermal Heating",
  "2071002015": "Heating and Cooling Producers - Geothermal",
  "2071002016": "Heating and Cooling Producers - Bioenergy",
  "2071002017": "Heating and Cooling Producers - Renewable Non-Fossil Gaseous and Liquid Fuels",
  "2072001001": "Water Collection, Treatment and Supplier",
  "2072001002": "Waste Water Collection, Treatment and Supplier",
  "2072001003": "Water Collection, Treatment and Supplier - Renewal",
  "2072001004": "Waste Water Collection, Treatment and Supplier - Renewal",
  "2072002001": "Electricity Generator - Gas",
  "2072002002": "Electricity Generator - Coal",
  "2072002003": "Electricity Generator - Oil",
  "2072002004": "Electricity Generator - Nuclear",
  "2072002005": "Electricity Generator - Other Non Renewable Sources",
  "2072002006": "Electricity Transmission and Distributor",
  "2072002007": "Electricity Storage",
  "2072003001": "Hydrogen Storage",
  "2072003002": "Renewable and Low-Carbon Gases Transmission and Distributor",
  "2072003003": "Non-Renewable Gases Transmission and Distributor",
  "2072004001": "Utilities - Diversified",
  "3081001001": "Telecom Service Provider",
  "3081001002": "Internet Service Provider",
  "3082001001": "Advertising",
  "3082001002": "Internet Advertising",
  "3082001003": "Marketing Agencies",
  "3082002001": "Print Media",
  "3082002002": "Electronic Media",
  "3082003001": "Television Broadcasting",
  "3082003002": "Radio Broadcasting",
  "3082004001": "Television and Film Production and Distributor",
  "3082004002": "Theater",
  "3082004003": "Theme Park",
  "3082004004": "Sports Team",
  "3082004005": "Sound Recorder and Publisher",
  "3082004006": "Cable Service Provider",
  "3082004007": "Subscription Based Television Provider",
  "3083001001": "Social Content Provider",
  "3083001002": "Internet Navigation and Information Services",
  "3083002001": "Electronic Gaming & Multimedia",
  "3091001001": "Onshore Oil and Gas Drilling",
  "3091001002": "Offshore Oil and Gas Drilling",
  "3091002001": "Oil Exploration and Production",
  "3091002002": "Gas Exploration and Production",
  "3091003001": "Oil & Gas Integrated",
  "3091004001": "Oil and Gas Storage",
  "3091004002": "Oil and Gas Transportation",
  "3091004003": "CO2 Transportation",
  "3091004004": "Underground Permanent Geological Storage of CO2",
  "3091004005": "Royalties from Oil and Gas",
  "3091005001": "Oil and Gas Refining",
  "3091005002": "Oil and Gas Marketing and Distribution",
  "3091006001": "Oilfield Equipment",
  "3091006002": "Oil and Gas Support Services",
  "3092001001": "Thermal Coal",
  "3092002001": "Uranium",
  "3101001001": "Weapons and Ammunition Manufacturer",
  "3101001002": "Ship and Marine Equipment Manufacturer",
  "3101001003": "Retrofitting of Inland Water Transport",
  "3101001004": "Retrofitting of Sea and Coastal Water Transport",
  "3101001005": "Air and Spacecraft Manufacturer",
  "3101001006": "Defense Services",
  "3102001001": "Printing Services",
  "3102001002": "Storage Provider",
  "3102001003": "Leasing or Licensing of Intellectual Property",
  "3102001004": "Accounting, Audit and Tax Services",
  "3102001005": "Business Legal Services",
  "3102001099": "Business Support Services",
  "3102002001": "Consulting Services",
  "3102002002": "Close to Market Research, Development and Innovation",
  "3102003001": "Rental and Leasing of Transport Equipment",
  "3102003002": "Rental and Leasing of Machinery and Equipment",
  "3102003003": "Rental and Leasing of Medical Equipment",
  "3102003004": "Rental and Leasing of Cars and Trucks",
  "3102003005": "Rental and Leasing of Aircrafts",
  "3102003099": "Rental and Leasing of Other Equipment",
  "3102004001": "Security Services Provider",
  "3102004002": "Correction Facility",
  "3102004003": "Immigration Detention",
  "3102005001": "Permanent Staffing Services",
  "3102005002": "Temporary Staffing Services",
  "3103001001": "Conglomerates",
  "3104001001": "Engineering Services",
  "3104001002": "Construction of Non Residential Buildings",
  "3104001003": "Renovation of Non Residential Buildings",
  "3104001004": "Infrastructure Enabling Low-Carbon Water Transportation",
  "3104001005": "Infrastructure Enabling Low-Carbon Road Transportation",
  "3104001006": "Infrastructure for Rail Transport Constructors",
  "3104001007": "Infrastructure Enabling Low-Carbon Airport",
  "3104001008": "Infrastructure for Personal Mobility and Cycle Logistics",
  "3104001009": "Charging Stations for Electric Vehicles in Buildings Service Providers",
  "3104001010": "Professional Services Related to Energy Performance of Buildings",
  "3104001099": "Other Engineering Projects",
  "3104002001": "Highway, Streets, and Roads Infrastructure Services",
  "3104002002": "Parking Services",
  "3104003001": "Energy Efficiency Equipment for Buildings Manufacturer",
  "3104003002": "Energy Efficiency Equipment Services",
  "3104003003": "Instruments and Devices for Measuring Energy Performance of Buildings",
  "3104003004": "Heating, Ventilation, and Air Conditioning (HVAC) Manufacturer",
  "3104003005": "Security and Protection Device Manufacturer",
  "3104003099": "Other Building Products and Equipment",
  "3105001001": "Construction Equipment Manufacturer",
  "3105001002": "Mining Equipment Manufacturer",
  "3105001003": "Truck Manufacturer",
  "3105001004": "Low Carbon Technology Heavy Duty Vehicle Manufacturer",
  "3105001005": "Agricultural Machinery Manufacturer",
  "3106001001": "Machinery and Equipment Distributor",
  "3106001002": "Building Products Distributor",
  "3107001001": "Stationery Products Manufacturer",
  "3107001002": "Office Equipment Manufacturer",
  "3107002001": "Machines Parts Manufacturer",
  "3107002002": "Textile and Apparel Machinery Manufacturer",
  "3107002003": "Food Processing Machinery Manufacturer",
  "3107002004": "Natural Gas Energy Equipment Manufacturer",
  "3107002005": "Nuclear Energy Equipment Manufacturer",
  "3107002006": "Hydrogen Equipment Manufacturer",
  "3107002007": "Renewable Energy Technologies Manufacturer",
  "3107002008": "Renewable Energy Technologies Services",
  "3107002098": "Heavy Industrial Machinery Manufacturer",
  "3107002099": "Other Low Carbon Technologies Manufacturer",
  "3107003001": "Metal Fabrication",
  "3107004001": "Waste Recycling Machinery Manufacturer",
  "3107004002": "Water Purification Systems Manufacturer",
  "3107004003": "Air Filtration Systems Manufacturer",
  "3107004004": "Research, Development and Innovation for Direct Air Capture of CO2",
  "3107005001": "Tools & Accessories",
  "3107006001": "Electric and Optical Cable Manufacturer",
  "3107006002": "Wiring Devices Manufacturer",
  "3107006003": "Electrical Transformer Manufacturer",
  "3107006004": "Batteries Manufacturer",
  "3107006005": "Electric Heat Pumps Services",
  "3107006099": "Other Electrical Equipment Manufacturer",
  "3108001001": "Airport Support Services",
  "3108001002": "Helicopters and Charter Services",
  "3108001099": "Other Airline Services",
  "3108002001": "Passenger Air Transportation",
  "3108002002": "Freight Air Transportation",
  "3108003001": "Passenger Interurban Rail Transportation",
  "3108003002": "Freight Rail Transportation",
  "3108003003": "Railway Locomotives and Equipment Manufacturer",
  "3108003004": "Transportation by Personal Mobility Devices",
  "3108003005": "Operation of Urban and Suburban Road Passenger Transport",
  "3108003006": "Transportation by Motorbikes, Passenger Cars, and Light Commercial Vehicles",
  "3108004001": "Inland Passenger Water Transportation",
  "3108004002": "Inland Freight Water Transportation",
  "3108004003": "Port Operator",
  "3108004004": "Ocean Freight Transportation",
  "3108004005": "Ocean Passenger Transportation",
  "3108004006": "Activities Incidental to Marine Transportation",
  "3108004007": "Sea and Coastal Passenger Water Transport",
  "3108004008": "Sea and Coastal Freight Water Transport",
  "3108005001": "Freight Transport Services by Road",
  "3108006001": "Postal and Courier Activities",
  "3108006002": "Logistics Support Activities",
  "3109001001": "Collection and Transport of Non-Hazardous Waste in Source Segregated Fractions",
  "3109001002": "Anaerobic Digestion of Bio-Waste",
  "3109001003": "Composting of Bio-Waste",
  "3109001004": "Material Recovery from Non-Hazardous Waste",
  "3109001005": "Landfill Gas Capture and Utilization",
  "3109001006": "Anaerobic Digestion of Sewage Sludge",
  "3109001007": "Collection, Treatment and Disposal of Hazardous Waste",
  "3111001001": "Data Processing, Hosting and Related Activities",
  "3111001002": "Data-driven Solutions for GHG Emission Reduction",
  "3111001003": "Information Technology Consulting and Outsourcing Services",
  "3111001099": "Other Information Technology Services",
  "3111002001": "Financial Software",
  "3111002002": "Communication and Entertainment Software",
  "3111002003": "Education Software",
  "3111002004": "Social Platform Software",
  "3111002005": "Business Productivity and Efficiency Software",
  "3111003001": "Computer Security Software",
  "3111003002": "Operating System Software",
  "3111003003": "Website Designers, Developers, and Operators",
  "3111003004": "Automation and Workflow Software",
  "3111003005": "Database Software",
  "3111003006": "Payment and Transaction Services",
  "3111003099": "Other Software Services",
  "3112001001": "Communication Equipment Manufacturer",
  "3112001002": "Fiberoptic Cable Manufacturer",
  "3112002001": "Computer Hardware",
  "3112003001": "Consumer Electronics",
  "3112004001": "Electronics Component Manufacturer",
  "3112004002": "Printed Circuit Board Manufacturer",
  "3112005001": "Electronic Equipment Distributor",
  "3112005002": "Computer and Related Peripheral Distributor",
  "3112006001": "Scientific & Technical Instruments",
  "3113001001": "Semiconductor Equipment & Materials",
  "3113002001": "Semiconductor Manufacturer",
  "3113002002": "Semiconductor Memory Manufacturer",
  "3113003001": "Solar",
};

function getName(code, type) {
  if (type === "industry") return INDUSTRY_NAMES[code] || code;
  return ACTIVITY_NAMES[code] || code;
}

function logClassification(industry, confidence, preview) {
  try {
    const raw = localStorage.getItem("il_classifications");
    const existing = raw ? JSON.parse(raw) : [];
    existing.push({ industry, confidence, preview: preview.slice(0, 60), ts: Date.now() });
    localStorage.setItem("il_classifications", JSON.stringify(existing.slice(-50)));
  } catch {}
}

// ── Particle Explosion Canvas ─────────────────────────────────────────────
function ExplosionCanvas({ trigger, color }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const cx = canvas.width / 2, cy = canvas.height / 2;

    const particles = Array.from({ length: 120 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2;
      const size = Math.random() * 4 + 1;
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size, alpha: 1,
        color: [color, "#fbbf24", "#f59e0b", "#ffffff"][Math.floor(Math.random() * 4)],
        decay: Math.random() * 0.015 + 0.008,
      };
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        if (p.alpha <= 0) return;
        alive = true;
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.15;
        p.vx *= 0.98; p.alpha -= p.decay;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      if (alive) animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [trigger, color]);

  return <canvas ref={canvasRef} className="explosion-canvas" />;
}

// ── Confidence Ring ───────────────────────────────────────────────────────
function ConfRing({ value, color }) {
  const r = 44, circ = 2 * Math.PI * r;
  const dash = Math.min(value / 100, 1) * circ;
  return (
    <svg className="conf-ring" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#f5ede0" strokeWidth="6" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
      <text x="50" y="46" textAnchor="middle" fill="#1c1008"
        style={{ fontSize: "16px", fontWeight: "800", fontFamily: "Playfair Display, serif" }}>
        {Math.round(value)}%
      </text>
      <text x="50" y="60" textAnchor="middle" fill="#a8a29e"
        style={{ fontSize: "7px", fontFamily: "DM Mono, monospace" }}>confidence</text>
    </svg>
  );
}

// ── Result Card ───────────────────────────────────────────────────────────
function ResultCard({ icon, label, code, name, confidence, topK, color, type }) {
  const [open, setOpen] = useState(false);
  const max = topK[0]?.confidence || 1;
  return (
    <div className="rc-card">
      <div className="rc-top">
        <div className="rc-left">
          <div className="rc-label">{icon} {label}</div>
          <div className="rc-name">{name}</div>
          <div className="rc-code">{code}</div>
        </div>
        <ConfRing value={confidence} color={color} />
      </div>
      <button className="rc-toggle" onClick={() => setOpen(!open)}>
        {open ? "▲" : "▼"} Top {topK.length} predictions
      </button>
      {open && (
        <div className="rc-list">
          {topK.map((p, i) => (
            <div key={p.code} className="rc-row">
              <span className="rc-rank" style={{ color }}>#{i + 1}</span>
              <div className="rc-info">
                <span className="rc-row-name">{getName(p.code, type)}</span>
                <span className="rc-row-code">{p.code}</span>
              </div>
              <div className="rc-bar-track">
                <div className="rc-bar-fill" style={{
                  width: `${(p.confidence / max) * 100}%`,
                  background: color
                }} />
              </div>
              <span className="rc-pct">{p.confidence}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── History Feed ──────────────────────────────────────────────────────────
function HistoryFeed({ history }) {
  if (history.length === 0) return null;
  return (
    <div className="history-wrap">
      <div className="history-title">
        <span className="history-icon">◎</span>
        Classification History
        <span className="history-count">{history.length} this session</span>
      </div>
      <div className="history-list">
        {[...history].reverse().map((h, i) => (
          <div key={i} className="history-item">
            <div className="hi-dot" style={{ background: h.confidence > 50 ? "#92400e" : h.confidence > 25 ? "#b45309" : "#d97706" }} />
            <div className="hi-info">
              <span className="hi-industry">{h.industry}</span>
              <span className="hi-preview">{h.preview}</span>
            </div>
            <div className="hi-right">
              <span className="hi-conf">{h.confidence}%</span>
              <span className="hi-time">{Math.floor((Date.now() - h.ts) / 1000)}s ago</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const EXAMPLES = [
  { label: "Semiconductors", long_profile: "The company is a global semiconductor manufacturer specialising in logic chips for mobile devices and data centres.", segment_name: "Mobile Solutions", segment_description: "Designs and sells application processors for smartphones." },
  { label: "E-Commerce", long_profile: "Amazon is one of the world\'s largest e-commerce and cloud computing companies operating online retail marketplaces and Amazon Web Services.", segment_name: "Cloud Computing", segment_description: "Amazon Web Services provides on-demand cloud infrastructure and machine learning services." },
  { label: "Pharma", long_profile: "The company is a biopharmaceutical firm focused on developing and commercialising treatments for rare genetic diseases and oncology.", segment_name: "Oncology", segment_description: "Development of targeted cancer therapies and immunotherapies." },
  { label: "Banking", long_profile: "The company is a multinational investment bank providing investment banking, securities, asset management and consumer banking.", segment_name: "Investment Banking", segment_description: "Advisory services for mergers, acquisitions and capital markets transactions." },
];

const INDUSTRY_COLORS = {
  "31130020": "#b45309", "31110020": "#4c1d95", "20610010": "#065f46",
  "10310010": "#1e3a5f", "10320020": "#831843", "31070020": "#1e40af",
};

function getColor(code) {
  return INDUSTRY_COLORS[code] || "#92400e";
}

export default function Classifier({ onDashboard }) {
  const [form, setForm] = useState({ long_profile: "", segment_name: "", segment_description: "", top_k: 3 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [explosion, setExplosion] = useState(0);
  const [explColor, setExplColor] = useState("#92400e");
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.long_profile.trim()) { setError("Company description is required."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await axios.post(`${API}/predict`, { ...form, top_k: Number(form.top_k) });
      setResult(res.data);
      const col = getColor(res.data.industry.code);
      setExplColor(col);
      setExplosion(e => e + 1);
      const indName = getName(res.data.industry.code, "industry");
      const entry = { industry: indName, confidence: res.data.industry.confidence, preview: form.long_profile.slice(0, 60), ts: Date.now() };
      setHistory(h => [...h, entry]);
      logClassification(indName, res.data.industry.confidence, form.long_profile);
    } catch { setError("API error — make sure the backend is running on port 8000."); }
    finally { setLoading(false); }
  };

  return (
    <div className="clf">
      <ExplosionCanvas trigger={explosion} color={explColor} />

      <div className="clf-inner">
        <div className="clf-header">
          <div className="clf-eyebrow">Company Classifier</div>
          <h2 className="clf-title">What industry is this company in?</h2>
          <p className="clf-sub">Paste a description below and our ML model will classify it instantly.</p>
        </div>

        <div className="clf-body">
          {/* Form */}
          <div className="clf-form-wrap">
            <div className="clf-examples">
              {EXAMPLES.map(ex => (
                <button key={ex.label} className="clf-ex-btn"
                  onClick={() => setForm(f => ({ ...f, ...ex }))}>
                  {ex.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="clf-form">
              <div className="clf-field">
                <label className="clf-label">Company Description <span className="clf-req">*</span></label>
                <textarea rows={6} className="clf-input"
                  placeholder="Describe the company\'s business, products, and markets…"
                  value={form.long_profile}
                  onChange={e => setForm({ ...form, long_profile: e.target.value })} />
              </div>

              <div className="clf-row">
                <div className="clf-field">
                  <label className="clf-label">Segment Name <span className="clf-opt">optional</span></label>
                  <input type="text" className="clf-input" placeholder="e.g. Cloud Computing"
                    value={form.segment_name}
                    onChange={e => setForm({ ...form, segment_name: e.target.value })} />
                </div>
                <div className="clf-field">
                  <label className="clf-label">Segment Description <span className="clf-opt">optional</span></label>
                  <input type="text" className="clf-input" placeholder="e.g. Infrastructure services…"
                    value={form.segment_description}
                    onChange={e => setForm({ ...form, segment_description: e.target.value })} />
                </div>
              </div>

              <div className="clf-field">
                <label className="clf-label">Top K predictions: <strong>{form.top_k}</strong></label>
                <input type="range" min={1} max={10} value={form.top_k}
                  onChange={e => setForm({ ...form, top_k: e.target.value })} className="clf-slider" />
              </div>

              {error && <div className="clf-error">{error}</div>}

              <div className="clf-btns">
                <button type="submit" className="clf-submit" disabled={loading}>
                  {loading ? <><span className="clf-spinner" /> Analysing…</> : "Classify →"}
                </button>
                <button type="button" className="clf-clear"
                  onClick={() => { setForm({ long_profile: "", segment_name: "", segment_description: "", top_k: 3 }); setResult(null); setError(""); }}>
                  Clear
                </button>
                <button type="button" className="clf-dash-btn" onClick={onDashboard}>
                  Analytics Dashboard →
                </button>
              </div>
            </form>
          </div>

          {/* Results */}
          {result && (
            <div className="clf-results">
              <div className="clf-res-header">
                <span className="clf-res-title">Classification Results</span>
                <span className="clf-latency">⚡ {result.latency_ms}ms</span>
              </div>
              <div className="clf-preview">
                <span className="clf-preview-icon">📄</span>
                {result.input_text_preview}
              </div>
              <div className="clf-cards">
                <ResultCard icon="🏭" label="GECS Industry" type="industry"
                  code={result.industry.code}
                  name={getName(result.industry.code, "industry")}
                  confidence={result.industry.confidence}
                  topK={result.industry_top_k}
                  color={getColor(result.industry.code)} />
                <ResultCard icon="🔬" label="Business Activity" type="activity"
                  code={result.subindustry.code}
                  name={getName(result.subindustry.code, "activity")}
                  confidence={result.subindustry.confidence}
                  topK={result.subindustry_top_k}
                  color="#4c1d95" />
              </div>
            </div>
          )}
        </div>

        {/* History */}
        <HistoryFeed history={history} />
      </div>
    </div>
  );
}
