import csv
import zipcodes

def convertToCSV(filename):
    with open('ml-1m/' + filename + ".dat") as dat_file, open('ml-1m/' + filename + '.csv', 'w') as csv_file:
        csv_writer = csv.writer(csv_file)

        for line in dat_file:
            row = [field.strip() for field in line.split('::')]
            csv_writer.writerow(row)

def convertZipCodeToState(filename):
    with open('ml-1m/' + filename) as csv_file, open('ml-1m/' + 'user_zip.csv', 'w') as csv_zip_file:
        csv_reader = csv.reader(csv_file)
        csv_writer = csv.writer(csv_zip_file)

        for line in csv_reader:
            zipcode = line[-1]
            try:
                zipcode = zipcodes.matching(str(zipcode))[0]['state']
                line[-1] = zipcode
            except:
                continue
            csv_writer.writerow(line) 

def main():
   convertToCSV('movies') 
   convertToCSV('ratings') 
   convertToCSV('users')
   convertZipCodeToState('users.csv')

if __name__ == "__main__":
    main()