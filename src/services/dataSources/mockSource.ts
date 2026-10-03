/**
 * Demo Data Source Adapter for Development (Seekora AI)
 *
 * NOTE: This is an explicitly labeled Development / Demo Data Source designed to prove
 * the multi-stage collection, normalization, validation, and deduplication pipeline
 * before authorized external APIs or datasets are connected.
 *
 * All records produced by this adapter are marked with `isDemo: true`.
 */

import { GenericRecord } from '../../types';
import { RawRecord, SourceAdapter, CollectionExecutionResult } from './sourceAdapter';

export class DemoSourceAdapter implements SourceAdapter {
  id = 'src-demo-adapter';
  name = 'Demo Public Data Registry';
  type: 'Demo Source' = 'Demo Source';
  baseUrl = 'https://api.seekora.demo/v1';
  status: 'Development' = 'Development';
  isDemo = true;

  async search(query: string, count: number = 25): Promise<RawRecord[]> {
    // Simulate brief API latency
    await new Promise((resolve) => setTimeout(resolve, 400));

    const q = query.toLowerCase();
    const rawList: RawRecord[] = [];

    // Detect domain
    const isJob = q.includes('job') || q.includes('developer') || q.includes('engineer') || q.includes('hiring');
    const isSaaS = q.includes('saas') || q.includes('startup') || q.includes('company') || q.includes('companies');

    const sampleCount = Math.min(Math.max(count, 12), 40);

    for (let i = 1; i <= sampleCount; i++) {
      let data: Record<string, any> = {};

      if (isJob) {
        const companies = [
          'Razorpay Technologies',
          'Postman Labs',
          'Zomato Engineering',
          'Swiggy Instamart',
          'Infosys BPM',
          'PhonePe Solutions',
          'MakeMyTrip',
          'Paytm Payments',
          'Cred Financial',
          'Urban Company',
          'Delhivery Logistics',
          'Groww Capital',
        ];
        const roles = [
          'Senior Java Engineer',
          'Lead Backend Developer',
          'Spring Boot Specialist',
          'Cloud Solutions Architect',
          'Platform Engineer',
          'Full Stack Developer',
          'Software Engineer II',
        ];
        const locations = ['Delhi NCR', 'Gurugram, HR', 'Noida, UP', 'New Delhi, DL', 'Remote (India)', 'Bangalore, KA'];
        const salaries = ['₹22 - 32 LPA', '₹28 - 40 LPA', '₹18 - 26 LPA', '₹35 - 50 LPA', null, '₹16 - 24 LPA'];

        const comp = companies[(i - 1) % companies.length];
        const role = roles[(i - 1) % roles.length];
        const loc = locations[(i - 1) % locations.length];
        const sal = salaries[(i - 1) % salaries.length];

        data = {
          Company: comp,
          Role: role,
          Location: loc,
          Salary: sal,
          'Application Link': `https://careers.demo-portal.org/positions/${comp.toLowerCase().replace(/\s+/g, '-')}-${i}`,
          'Experience Level': i % 3 === 0 ? '5+ Years' : '3-5 Years',
        };
      } else if (isSaaS) {
        const saasNames = [
          'Hasura Inc',
          'Postman',
          'Chargebee',
          'BrowserStack',
          'Freshworks',
          'Icertis',
          'Zenoti',
          'Druva Systems',
          'Innovaccer',
          'Darwinbox',
          'CleverTap',
          'Whatfix',
        ];
        const industries = ['API Infrastructure', 'Developer Tools', 'Fintech & Billing', 'Testing Cloud', 'Customer Engagement', 'Contract Intelligence', 'Health Cloud'];
        const locs = ['Bangalore, KA', 'Chennai, TN', 'Pune, MH', 'Hyderabad, TS', 'San Francisco / India'];
        const empRanges = ['250 - 500', '1,000+', '500 - 1,000', '100 - 250', '50 - 100'];

        const name = saasNames[(i - 1) % saasNames.length];
        data = {
          Company: name,
          Website: `https://www.${name.toLowerCase().replace(/\s+/g, '')}.demo.io`,
          Industry: industries[(i - 1) % industries.length],
          Employees: empRanges[(i - 1) % empRanges.length],
          Location: locs[(i - 1) % locs.length],
          Funding: i % 2 === 0 ? 'Series B ($35M)' : 'Series C ($75M)',
        };
      } else {
        // Generic entity generator
        data = {
          Title: `Index Item ${i} (${query.slice(0, 15)})`,
          Category: 'Public Registry',
          Status: 'Active',
          Score: (8.2 + (i % 15) * 0.1).toFixed(1),
          Location: 'National / Regional',
          Reference: `REF-DP-${1000 + i}`,
        };
      }

      // Inject 2 planned duplicates for testing deduplication engine
      if (i === 7 && rawList.length > 0) {
        data = { ...rawList[0].data };
      }
      if (i === 14 && rawList.length > 3) {
        data = { ...rawList[3].data };
      }

      rawList.push({
        id: `raw-${i}`,
        sourceId: 'src-demo-adapter',
        sourceName: 'Public Demo Registry (Development)',
        sourceUrl: `https://registry.demo.seekora.ai/record/${i}`,
        data,
        timestamp: `${i * 3 + 2}m ago`,
      });
    }

    return rawList;
  }

  normalize(raw: RawRecord[], requestedFields: string[]): GenericRecord[] {
    return raw.map((item, index) => {
      const normalizedFields: Record<string, string | number | boolean | null> = {};

      // If specific fields were requested, prioritize them
      if (requestedFields && requestedFields.length > 0) {
        requestedFields.forEach((field) => {
          // Case-insensitive match against raw data keys
          const matchedKey = Object.keys(item.data).find(
            (k) => k.toLowerCase() === field.toLowerCase()
          );
          normalizedFields[field] = matchedKey ? item.data[matchedKey] : item.data[field] ?? null;
        });

        // Also preserve any extra fields present in raw data
        Object.keys(item.data).forEach((key) => {
          if (!normalizedFields[key]) {
            normalizedFields[key] = item.data[key];
          }
        });
      } else {
        Object.assign(normalizedFields, item.data);
      }

      return {
        id: `rec-col-${Date.now()}-${index + 1}`,
        collectionId: '',
        fields: normalizedFields,
        sourceId: item.sourceId,
        sourceName: item.sourceName,
        sourceUrl: item.sourceUrl,
        sourceType: 'Public Demo API',
        collectedAt: item.timestamp || 'Just now',
        status: 'valid',
        isDemo: true,
      };
    });
  }

  validate(records: GenericRecord[], requiredFields: string[]): GenericRecord[] {
    return records.map((rec) => {
      const notes: string[] = [];
      let isInvalid = false;

      // Check for missing values in required fields or primary keys
      const keysToCheck = requiredFields.length > 0 ? requiredFields : Object.keys(rec.fields).slice(0, 2);

      keysToCheck.forEach((key) => {
        const val = rec.fields[key];
        if (val === null || val === undefined || val === '') {
          notes.push(`Missing field value: "${key}"`);
          isInvalid = true;
        }
      });

      // Simple URL validation if any URL fields exist
      Object.entries(rec.fields).forEach(([k, v]) => {
        if (typeof v === 'string' && (k.toLowerCase().includes('url') || k.toLowerCase().includes('link'))) {
          if (!v.startsWith('http://') && !v.startsWith('https://')) {
            notes.push(`Malformed URL in field: "${k}"`);
            isInvalid = true;
          }
        }
      });

      return {
        ...rec,
        status: isInvalid ? 'invalid' : rec.status,
        validationNotes: notes.length > 0 ? notes : undefined,
      };
    });
  }

  deduplicate(records: GenericRecord[], keyFields: string[]): GenericRecord[] {
    const seenSignatures = new Map<string, string>();

    return records.map((rec) => {
      // Create a deterministic signature based on key fields
      const signatureParts =
        keyFields.length > 0
          ? keyFields.map((k) => String(rec.fields[k] || '').trim().toLowerCase())
          : Object.values(rec.fields).slice(0, 3).map((v) => String(v || '').trim().toLowerCase());

      const signature = signatureParts.join('::');

      if (seenSignatures.has(signature)) {
        const originalId = seenSignatures.get(signature)!;
        return {
          ...rec,
          status: 'duplicate',
          duplicateOf: originalId,
          validationNotes: [
            ...(rec.validationNotes || []),
            `Duplicate record of existing entry #${originalId.slice(-4)}`,
          ],
        };
      }

      seenSignatures.set(signature, rec.id);
      return rec;
    });
  }

  async collect(
    collectionId: string,
    query: string,
    requestedFields: string[],
    count: number = 24
  ): Promise<CollectionExecutionResult> {
    // 1. Fetch raw data
    const raw = await this.search(query, count);

    // 2. Normalize
    const normalized = this.normalize(raw, requestedFields);
    normalized.forEach((r) => (r.collectionId = collectionId));

    // 3. Validate
    const validated = this.validate(normalized, requestedFields.slice(0, 2));

    // 4. Deduplicate
    const finalRecords = this.deduplicate(validated, requestedFields.slice(0, 3));

    // Compute stats
    const stats = {
      total: finalRecords.length,
      valid: finalRecords.filter((r) => r.status === 'valid').length,
      duplicates: finalRecords.filter((r) => r.status === 'duplicate').length,
      needsReview: finalRecords.filter((r) => r.status === 'invalid').length,
    };

    return {
      records: finalRecords,
      stats,
      sourcesUsed: ['Public Demo Registry (Development)'],
    };
  }
}

export const defaultDemoSource = new DemoSourceAdapter();
